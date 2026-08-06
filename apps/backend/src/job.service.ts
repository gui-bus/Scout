import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { normalizeLink } from "./utils/link-normalizer";
import { identifyLevel } from "./utils/job-classifier";

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  async listJobs(filters: any = {}, page = 1, perPage = 20) {
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

    if (filters.period) {
      const dateLimit = new Date();
      if (filters.period === "hoje") {
        dateLimit.setHours(0, 0, 0, 0);
        where.publishedAt = { gte: dateLimit };
      } else if (filters.period === "semana") {
        dateLimit.setDate(dateLimit.getDate() - 7);
        where.publishedAt = { gte: dateLimit };
      } else if (filters.period === "mes") {
        dateLimit.setDate(dateLimit.getDate() - 30);
        where.publishedAt = { gte: dateLimit };
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

    const pages = Math.ceil(total / perPage);

    return {
      items,
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

    const job = await this.prisma.job.create({
      data: {
        title: data.title,
        description: data.description || null,
        company: data.company || null,
        location: data.location || null,
        modality: data.modality || null,
        level: data.level || identifyLevel(data),
        technologies: data.technologies || null,
        source: data.source || null,
        link: normalized,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
    });

    return { job, created: true };
  }
}
