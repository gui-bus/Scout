import { Controller, Get, Post, Param, Query, Body, ParseIntPipe, NotFoundException, UseGuards, Request } from "@nestjs/common";
import { JobService } from "./job.service";
import { JwtAuthGuard, OptionalJwtAuthGuard } from "./auth/jwt-auth.guard";

@Controller("api/jobs")
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  async listJobs(
    @Request() req: any,
    @Query("busca") busca?: string,
    @Query("company") company?: string,
    @Query("technology") technology?: string,
    @Query("location") location?: string,
    @Query("modality") modality?: string | string[],
    @Query("level") level?: string | string[],
    @Query("period") period?: string,
    @Query("source") source?: string | string[],
    @Query("contractType") contractType?: string,
    @Query("directContactsOnly") directContactsOnly?: string,
    @Query("exclude") exclude?: string,
    @Query("city") city?: string,
    @Query("favoritesOnly") favoritesOnly?: string,
    @Query("appliedOnly") appliedOnly?: string,
    @Query("page") page = 1,
    @Query("per_page") perPage = 20
  ) {
    const filters = {
      busca,
      company,
      technology,
      location,
      modality,
      level,
      period,
      source,
      contractType,
      directContactsOnly,
      exclude,
      city,
      favoritesOnly,
      appliedOnly,
    };

    const userId = req.user?.id;

    return this.jobService.listJobs(filters, Number(page), Number(perPage), userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/state")
  async setJobState(
    @Request() req: any,
    @Param("id", ParseIntPipe) id: number,
    @Body() body: { isFavorite?: boolean; isApplied?: boolean; isViewed?: boolean }
  ) {
    const userId = req.user.id;
    return this.jobService.setJobState(userId, id, body);
  }

  @Get("stats")
  async getStats() {
    return this.jobService.getStats();
  }

  @Get(":id")
  async getJobById(@Param("id", ParseIntPipe) id: number) {
    const job = await this.jobService.getJobById(id);
    if (!job) {
      throw new NotFoundException("Job not found.");
    }
    return job;
  }

  @Post()
  async createJob(@Body() body: any) {
    return this.jobService.createJob(body);
  }
}
