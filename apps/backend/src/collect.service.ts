import { Injectable } from "@nestjs/common";
import { JobService } from "./job.service";
import { PrismaService } from "./prisma.service";
import { GupyCollector } from "./collectors/gupy-collector";
import { SolidesCollector } from "./collectors/solides-collector";
import { RemotarCollector } from "./collectors/remotar-collector";
import { JoobleCollector } from "./collectors/jooble-collector";
import { GithubCollector } from "./collectors/github-collector";
import { RemotiveCollector } from "./collectors/remotive-collector";
import { BaseCollector } from "./collectors/base-collector";
import { isSoftwareJob, identifyLevel } from "./utils/job-classifier";

@Injectable()
export class CollectService {
  private isCollecting = false;

  constructor(
    private readonly jobService: JobService,
    private readonly prisma: PrismaService
  ) {}

  getCollectingStatus(): boolean {
    return this.isCollecting;
  }

  async runCollection() {
    if (this.isCollecting) {
      throw new Error("Collection is already in progress.");
    }

    this.isCollecting = true;

    try {
      const startTime = performance.now();

      const joobleApiKey = process.env.JOOBLE_API_KEY || "";

      const collectors: BaseCollector[] = [
        new GupyCollector("desenvolvedor", 50, 200, 90),
        new GupyCollector("software engineer", 50, 200, 90),
        new GupyCollector("programador", 50, 200, 90),
        new GupyCollector("backend", 50, 200, 90),
        new GupyCollector("frontend", 50, 200, 90),
        new GupyCollector("fullstack", 50, 200, 90),
        new GupyCollector("dev", 50, 200, 90),
        new GupyCollector("ti", 50, 200, 90),
        new GupyCollector("tecnologia", 50, 200, 90),
        new GupyCollector("tech", 50, 200, 90),

        new SolidesCollector("desenvolvedor", 14, 200, 90),
        new SolidesCollector("software engineer", 14, 200, 90),
        new SolidesCollector("programador", 14, 200, 90),
        new SolidesCollector("backend", 14, 200, 90),
        new SolidesCollector("frontend", 14, 200, 90),
        new SolidesCollector("fullstack", 14, 200, 90),
        new SolidesCollector("ti", 14, 200, 90),
        new SolidesCollector("tecnologia", 14, 200, 90),
        new SolidesCollector("tech", 14, 200, 90),

        new RemotarCollector(10, [4, 7, 13, 14], 100, 90),
        new RemotarCollector(17, [4, 7, 13, 14], 100, 90),
        new RemotarCollector(21, [4, 7, 13, 14], 100, 90),
        new RemotarCollector(23, [4, 7, 13, 14], 100, 90),

        new GithubCollector("backend-br/vagas", 90),
        new GithubCollector("frontendbr/vagas", 90),
        new GithubCollector("react-brasil/vagas", 90),

        new RemotiveCollector(90),
      ];

      if (joobleApiKey) {
        collectors.push(
          new JoobleCollector("desenvolvedor", joobleApiKey, "Brasil", 100, 5, 90),
          new JoobleCollector("software engineer", joobleApiKey, "Brasil", 100, 5, 90),
          new JoobleCollector("programador", joobleApiKey, "Brasil", 100, 5, 90),
          new JoobleCollector("dev", joobleApiKey, "Brasil", 100, 5, 90)
        );
      }

      const totals = {
        found: 0,
        filteredOut: 0,
        duplicates: 0,
        inserted: 0,
      };

      const sources: Record<string, typeof totals> = {};
      const errors: any[] = [];

      for (const collector of collectors) {
        const state = await this.prisma.collectionState.findUnique({
          where: {
            source_queryKey: {
              source: collector.source,
              queryKey: collector.queryKey,
            },
          },
        });

        let dateLimit: Date;
        if (state && state.lastPublicationFound) {
          dateLimit = new Date(state.lastPublicationFound);
          dateLimit.setDate(dateLimit.getDate() - 5);
        } else {
          dateLimit = new Date();
          dateLimit.setDate(dateLimit.getDate() - 90);
        }

        collector.setLimitDate(dateLimit);
      }

      const newlyInsertedJobs: any[] = [];

      const runCollector = async (collector: BaseCollector) => {
        const sourceName = collector.source;
        if (!sources[sourceName]) {
          sources[sourceName] = { found: 0, filteredOut: 0, duplicates: 0, inserted: 0 };
        }

        try {
          const rawJobs = await collector.collect();
          const count = rawJobs.length;
          sources[sourceName].found += count;
          totals.found += count;

          for (const rawJob of rawJobs) {
            if (!isSoftwareJob(rawJob)) {
              sources[sourceName].filteredOut++;
              totals.filteredOut++;
              continue;
            }

            const level = rawJob.level || identifyLevel(rawJob);
            rawJob.level = level;

            const { created, job } = await this.jobService.createJob(rawJob);
            if (created) {
              sources[sourceName].inserted++;
              totals.inserted++;
              newlyInsertedJobs.push(job);
            } else {
              sources[sourceName].duplicates++;
              totals.duplicates++;
            }
          }

          const lastPublication = collector.getMostRecentDate(rawJobs);

          await this.prisma.collectionState.upsert({
            where: {
              source_queryKey: {
                source: collector.source,
                queryKey: collector.queryKey,
              },
            },
            update: {
              lastRun: new Date(),
              lastPublicationFound: lastPublication || undefined,
            },
            create: {
              source: collector.source,
              queryKey: collector.queryKey,
              lastRun: new Date(),
              lastPublicationFound: lastPublication,
            },
          });
        } catch (err: any) {
          errors.push({
            source: sourceName,
            error: err.message || String(err),
          });
        }
      };

      const limit = 5;
      const queue = [...collectors];
      const activePromises: Promise<void>[] = [];

      while (queue.length > 0 || activePromises.length > 0) {
        while (activePromises.length < limit && queue.length > 0) {
          const col = queue.shift()!;
          const promise = runCollector(col).then(() => {
            activePromises.splice(activePromises.indexOf(promise), 1);
          });
          activePromises.push(promise);
        }
        if (activePromises.length > 0) {
          await Promise.race(activePromises);
        }
      }

      // Check user saved filters for matching jobs and trigger notifications
      if (newlyInsertedJobs.length > 0) {
        const users = await this.prisma.user.findMany({
          where: {
            savedFilters: {
              not: null,
            },
          },
        });

        for (const user of users) {
          let userFilters: any[] = [];
          try {
            userFilters = JSON.parse(user.savedFilters || "[]");
          } catch (e) {
            continue;
          }

          for (const filter of userFilters) {
            if (!filter) continue;

            const matchingJobs = newlyInsertedJobs.filter((job) => matchJobWithFilter(job, filter));
            for (const job of matchingJobs) {
              await this.prisma.notification.create({
                data: {
                  userId: user.id,
                  title: `Nova vaga encontrada: ${job.title}`,
                  message: `${job.company || "Empresa não informada"} em ${job.location || "Qualquer lugar"} (${job.modality || "Qualquer modalidade"})`,
                  jobId: job.id,
                },
              });
            }
          }
        }
      }

      const durationSeconds = Number(((performance.now() - startTime) / 1000).toFixed(2));

      return {
        totals,
        sources,
        durationSeconds,
        errors,
      };
    } finally {
      this.isCollecting = false;
    }
  }
}

function matchJobWithFilter(job: any, filter: any): boolean {
  if (!filter) return false;

  // 1. busca
  if (filter.busca && filter.busca.trim() !== "") {
    const search = filter.busca.toLowerCase().trim();
    const titleMatch = job.title?.toLowerCase().includes(search);
    const descMatch = job.description?.toLowerCase().includes(search);
    const techMatch = job.technologies?.toLowerCase().includes(search);
    if (!titleMatch && !descMatch && !techMatch) {
      return false;
    }
  }

  // 2. company
  if (filter.company && filter.company.trim() !== "") {
    const company = filter.company.toLowerCase().trim();
    if (!job.company?.toLowerCase().includes(company)) {
      return false;
    }
  }

  // 3. location / city
  if (filter.city && filter.city.trim() !== "") {
    const city = filter.city.toLowerCase().trim();
    if (!job.location?.toLowerCase().includes(city)) {
      return false;
    }
  } else if (filter.location && filter.location.trim() !== "") {
    const location = filter.location.toLowerCase().trim();
    if (!job.location?.toLowerCase().includes(location)) {
      return false;
    }
  }

  // 4. contractType
  if (filter.contractType && filter.contractType !== "todos") {
    const type = filter.contractType.toUpperCase();
    const jobType = job.contractType?.toUpperCase() || "";
    if (type === "CLT" && !jobType.includes("CLT")) {
      return false;
    }
    if (type === "PJ" && !jobType.includes("PJ")) {
      return false;
    }
  }

  // 5. directContactsOnly
  if (filter.directContactsOnly && !job.contactsText) {
    return false;
  }

  // 6. exclude
  if (filter.exclude && filter.exclude.trim() !== "") {
    const excludeTerms = filter.exclude.split(",").map((t: string) => t.trim().toLowerCase()).filter((t: string) => t !== "");
    for (const term of excludeTerms) {
      if (job.title?.toLowerCase().includes(term) || job.description?.toLowerCase().includes(term)) {
        return false;
      }
    }
  }

  // 7. sources
  if (filter.sources && filter.sources.length > 0) {
    const jobSource = job.source || "";
    const matchesSource = filter.sources.some((src: string) => {
      if (src.toLowerCase() === "github") {
        return jobSource.toLowerCase().startsWith("github");
      }
      return jobSource.toLowerCase().includes(src.toLowerCase());
    });
    if (!matchesSource) return false;
  }

  // 8. modalities
  if (filter.modalities && filter.modalities.length > 0) {
    const jobModality = job.modality || "";
    const matchesModality = filter.modalities.some((mod: string) => jobModality.toLowerCase().includes(mod.toLowerCase()));
    if (!matchesModality) return false;
  }

  // 9. levels
  if (filter.levels && filter.levels.length > 0) {
    const jobLevel = job.level || "";
    const matchesLevel = filter.levels.some((lvl: string) => jobLevel.toLowerCase().includes(lvl.toLowerCase()));
    if (!matchesLevel) return false;
  }

  return true;
}

