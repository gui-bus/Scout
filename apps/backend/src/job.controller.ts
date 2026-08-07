import { Controller, Get, Post, Param, Query, Body, ParseIntPipe, NotFoundException } from "@nestjs/common";
import { JobService } from "./job.service";

@Controller("api/jobs")
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  async listJobs(
    @Query("busca") busca?: string,
    @Query("company") company?: string,
    @Query("technology") technology?: string,
    @Query("location") location?: string,
    @Query("modality") modality?: string | string[],
    @Query("level") level?: string | string[],
    @Query("period") period?: string,
    @Query("source") source?: string | string[],
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
    };

    return this.jobService.listJobs(filters, Number(page), Number(perPage));
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
