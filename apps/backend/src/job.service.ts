import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { normalizeLink } from "./utils/link-normalizer";
import { identifyLevel } from "./utils/job-classifier";
import { extractMetadata, extractState } from "./utils/job-extractor";

const SYNONYM_MAP: Record<string, string[]> = {
  "mobile": ["react native", "flutter", "ios", "android", "kotlin", "swift", "aplicativo", "aplicativos"],
  "frontend": ["react", "next.js", "vue", "angular", "tailwind", "javascript", "typescript", "front end", "front-end"],
  "backend": ["node.js", "nestjs", "express", "fastify", "go", "python", "java", "c#", "dotnet", "back end", "back-end"],
  "design": ["figma", "ui/ux", "product designer", "web design", "ux designer", "ui designer"],
  "devops": ["docker", "kubernetes", "aws", "ci/cd", "github actions", "devops engineer", "terraform"],
};

function getSearchSynonyms(searchTerm: string): string[] {
  const searchLower = searchTerm.toLowerCase();
  const foundTerms: string[] = [];
  
  for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (searchLower === key || searchLower.includes(key)) {
      foundTerms.push(...synonyms);
    }
  }
  
  return Array.from(new Set(foundTerms));
}

function getTitleSimilarity(title1: string, title2: string): number {
  const t1 = title1
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, " ")      // remove non-alphanumeric
    .split(/\s+/)
    .filter(w => w.length > 2);     // keep words with length > 2

  const t2 = title2
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, " ")      // remove non-alphanumeric
    .split(/\s+/)
    .filter(w => w.length > 2);

  if (t1.length === 0 || t2.length === 0) return 0;

  const intersection = t1.filter(word => t2.includes(word));
  const union = Array.from(new Set([...t1, ...t2]));

  return intersection.length / union.length;
}

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  async listJobs(filters: any = {}, page = 1, perPage = 20, userId?: number) {
    const where: any = {};

    if (filters.busca) {
      const search = filters.busca.trim();
      const synonyms = getSearchSynonyms(search);
      
      const searchConditions = [
        { title: { contains: search } },
        { description: { contains: search } },
        { technologies: { contains: search } },
      ];

      for (const syn of synonyms) {
        searchConditions.push(
          { title: { contains: syn } },
          { description: { contains: syn } },
          { technologies: { contains: syn } }
        );
      }

      where.OR = searchConditions;
    }

    if (filters.company) {
      where.company = { contains: filters.company };
    }

    if (filters.technology) {
      where.technologies = { contains: filters.technology };
    }

    if (filters.city) {
      where.location = { contains: filters.city };
    } else if (filters.location) {
      const matchState = filters.location.match(/,\s*([A-Z]{2})$/);
      if (matchState) {
        const uf = matchState[1];
        where.location = { contains: uf };
      } else {
        where.location = { contains: filters.location };
      }
    }

    if (filters.modality && filters.modality.length > 0) {
      where.modality = { in: Array.isArray(filters.modality) ? filters.modality : [filters.modality] };
    }

    if (filters.level && filters.level.length > 0) {
      where.level = { in: Array.isArray(filters.level) ? filters.level : [filters.level] };
    }

    if (filters.source && filters.source.length > 0) {
      const sourcesList = Array.isArray(filters.source) ? filters.source : [filters.source];
      const hasGithub = sourcesList.includes("GitHub");

      if (hasGithub) {
        where.OR = [
          { source: { startsWith: "GitHub" } },
          { source: { in: sourcesList.filter((s: string) => s !== "GitHub") } },
        ];
      } else {
        where.source = { in: sourcesList };
      }
    }

    if (filters.contractType && filters.contractType !== "todos") {
      if (filters.contractType === "CLT") {
        where.contractType = { in: ["CLT", "CLT/PJ"] };
      } else if (filters.contractType === "PJ") {
        where.contractType = { in: ["PJ", "CLT/PJ"] };
      }
    }

    if (filters.directContactsOnly === "true" || filters.directContactsOnly === true) {
      where.contactsText = { not: null };
    }

    if (filters.exclude && filters.exclude.trim() !== "") {
      const excludeList = filters.exclude
        .split(",")
        .map((t: string) => t.trim())
        .filter((t: string) => t !== "");

      if (excludeList.length > 0) {
        where.AND = [
          ...(where.AND || []),
          ...excludeList.map((term: string) => ({
            NOT: [
              { title: { contains: term } },
              { description: { contains: term } },
            ],
          })),
        ];
      }
    }

    if (userId) {
      if (filters.favoritesOnly === "true" || filters.favoritesOnly === true) {
        where.jobStates = {
          some: {
            userId,
            isFavorite: true,
          },
        };
      }
      if (filters.appliedOnly === "true" || filters.appliedOnly === true) {
        where.jobStates = {
          some: {
            userId,
            isApplied: true,
          },
        };
      }
    }

    if (filters.period) {
      const dateLimit = new Date();
      if (filters.period === "hoje") {
        dateLimit.setHours(0, 0, 0, 0);
        where.publishedAt = { gte: dateLimit };
      } else if (filters.period === "24h") {
        dateLimit.setHours(dateLimit.getHours() - 24);
        where.publishedAt = { gte: dateLimit };
      } else if (filters.period === "3dias") {
        dateLimit.setDate(dateLimit.getDate() - 3);
        where.publishedAt = { gte: dateLimit };
      } else if (filters.period === "semana") {
        dateLimit.setDate(dateLimit.getDate() - 7);
        where.publishedAt = { gte: dateLimit };
      } else if (filters.period === "mes") {
        dateLimit.setDate(dateLimit.getDate() - 30);
        where.publishedAt = { gte: dateLimit };
      } else if (filters.period === "coletadas_hoje") {
        dateLimit.setHours(0, 0, 0, 0);
        where.collectedAt = { gte: dateLimit };
      }
    }

    const skip = (page - 1) * perPage;
    const take = perPage;

    const [items, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        orderBy: [
          { publishedAt: "desc" },
          { collectedAt: "desc" },
        ],
        skip,
        take,
      }),
      this.prisma.job.count({ where }),
    ]);

    let userStates: any[] = [];
    if (userId && items.length > 0) {
      userStates = await this.prisma.userJobState.findMany({
        where: {
          userId,
          jobId: { in: items.map((item) => item.id) },
        },
      });
    }

    const itemsWithState = items.map((item) => {
      const state = userStates.find((s) => s.jobId === item.id);
      return {
        ...item,
        isFavorite: state?.isFavorite ?? false,
        isApplied: state?.isApplied ?? false,
        isViewed: state?.isViewed ?? false,
      };
    });

    const pages = Math.ceil(total / perPage);

    return {
      items: itemsWithState,
      pagination: {
        page,
        perPage,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  }

  async getJobById(id: number) {
    return this.prisma.job.findUnique({
      where: { id },
    });
  }

  async setJobState(userId: number, jobId: number, data: { isFavorite?: boolean; isApplied?: boolean; isViewed?: boolean }) {
    const existing = await this.prisma.userJobState.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });

    return this.prisma.userJobState.upsert({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
      update: {
        isFavorite: data.isFavorite !== undefined ? data.isFavorite : existing?.isFavorite,
        isApplied: data.isApplied !== undefined ? data.isApplied : existing?.isApplied,
        isViewed: data.isViewed !== undefined ? data.isViewed : existing?.isViewed,
      },
      create: {
        userId,
        jobId,
        isFavorite: data.isFavorite ?? false,
        isApplied: data.isApplied ?? false,
        isViewed: data.isViewed ?? false,
      },
    });
  }

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const jobsCollectedToday = await this.prisma.job.findMany({
      where: {
        collectedAt: {
          gte: today,
        },
      },
      select: {
        source: true,
      },
    });

    const stats: Record<string, number> = {};
    let totalToday = 0;

    for (const job of jobsCollectedToday) {
      const source = job.source || "Outros";
      const key = source.startsWith("GitHub") ? "GitHub" : source;
      stats[key] = (stats[key] || 0) + 1;
      totalToday++;
    }

    return {
      totalToday,
      bySource: stats,
    };
  }

  async createJob(data: any) {
    const normalized = normalizeLink(data.link) || data.link;

    const existingByLink = await this.prisma.job.findFirst({
      where: {
        link: {
          contains: normalized,
        },
      },
    });

    if (existingByLink) {
      return { job: existingByLink, created: false };
    }

    if (data.title && data.company) {
      const companyLower = data.company.toLowerCase().trim();

      const candidateJobs = await this.prisma.job.findMany({
        where: {
          company: data.company,
        },
      });

      const matchedJob = candidateJobs.find((j) => {
        // Only deduplicate if levels match or one is not specified
        const level1 = j.level?.toLowerCase() || "not specified";
        const level2 = data.level?.toLowerCase() || "not specified";
        const levelsMatch = level1 === level2 || level1.includes("not specified") || level2.includes("not specified");
        if (!levelsMatch) return false;

        const similarity = getTitleSimilarity(j.title, data.title);
        return similarity >= 0.60;
      });

      if (matchedJob) {
        const currentSources = matchedJob.source ? matchedJob.source.split(",").map((s) => s.trim()) : [];
        const newSource = data.source ? data.source.trim() : "";
        if (newSource && !currentSources.includes(newSource)) {
          currentSources.push(newSource);
        }

        const currentLinks = matchedJob.link ? matchedJob.link.split(",").map((l) => l.trim()) : [];
        if (normalized && !currentLinks.includes(normalized)) {
          currentLinks.push(normalized);
        }

        const updatedJob = await this.prisma.job.update({
          where: { id: matchedJob.id },
          data: {
            source: currentSources.join(", "),
            link: currentLinks.join(","),
          },
        });

        return { job: updatedJob, created: false };
      }
    }

    const metadata = extractMetadata(data.description);
    const normalizedLoc = extractState(data.location || null);

    const job = await this.prisma.job.create({
      data: {
        title: data.title,
        description: data.description || null,
        company: data.company || null,
        location: normalizedLoc,
        modality: data.modality || null,
        level: data.level || identifyLevel(data),
        technologies: data.technologies || metadata.technologies || null,
        source: data.source || null,
        link: normalized,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
        contractType: data.contractType || metadata.contractType,
        salaryText: data.salaryText || metadata.salaryText,
        contactsText: data.contactsText || metadata.contactsText,
      },
    });

    return { job, created: true };
  }
}
