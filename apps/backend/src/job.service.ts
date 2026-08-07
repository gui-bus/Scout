import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { normalizeLink } from "./utils/link-normalizer";
import { identifyLevel } from "./utils/job-classifier";
import { extractMetadata } from "./utils/job-extractor";

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  async listJobs(filters: any = {}, page = 1, perPage = 20, userId?: number) {
    const where: any = {};

    if (filters.busca) {
      const search = filters.busca.trim();
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { technologies: { contains: search } },
      ];
    }

    if (filters.company) {
      where.company = { contains: filters.company };
    }

    if (filters.technology) {
      where.technologies = { contains: filters.technology };
    }

    if (filters.location) {
      where.location = { contains: filters.location };
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

  async setJobState(userId: number, jobId: number, data: { isFavorite?: boolean; isApplied?: boolean }) {
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
      },
      create: {
        userId,
        jobId,
        isFavorite: data.isFavorite ?? false,
        isApplied: data.isApplied ?? false,
      },
    });
  }

  async createJob(data: any) {
    if (!data.title) {
      throw new BadRequestException("Title is required.");
    }
    if (!data.link) {
      throw new BadRequestException("Link is required.");
    }

    const normalized = normalizeLink(data.link) || data.link;

    const existing = await this.prisma.job.findUnique({
      where: { link: normalized },
    });

    if (existing) {
      return { job: existing, created: false };
    }

    const metadata = extractMetadata(data.description);

    const job = await this.prisma.job.create({
      data: {
        title: data.title,
        description: data.description || null,
        company: data.company || null,
        location: data.location || null,
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
