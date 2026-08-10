import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JobService } from './job.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from './auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Jobs')
@Controller('api/jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'List jobs', description: 'Returns paginated jobs applying multiple structured filters' })
  @ApiQuery({ name: 'busca', required: false, type: String })
  @ApiQuery({ name: 'company', required: false, type: String })
  @ApiQuery({ name: 'technology', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiQuery({ name: 'modality', required: false, type: String })
  @ApiQuery({ name: 'level', required: false, type: String })
  @ApiQuery({ name: 'period', required: false, type: String })
  @ApiQuery({ name: 'source', required: false, type: String })
  @ApiQuery({ name: 'contractType', required: false, type: String })
  @ApiQuery({ name: 'directContactsOnly', required: false, type: String })
  @ApiQuery({ name: 'exclude', required: false, type: String })
  @ApiQuery({ name: 'city', required: false, type: String })
  @ApiQuery({ name: 'favoritesOnly', required: false, type: String })
  @ApiQuery({ name: 'appliedOnly', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'per_page', required: false, type: Number })
  async listJobs(
    @Request() req: any,
    @Query('busca') busca?: string,
    @Query('company') company?: string,
    @Query('technology') technology?: string,
    @Query('location') location?: string,
    @Query('modality') modality?: string | string[],
    @Query('level') level?: string | string[],
    @Query('period') period?: string,
    @Query('source') source?: string | string[],
    @Query('contractType') contractType?: string,
    @Query('directContactsOnly') directContactsOnly?: string,
    @Query('exclude') exclude?: string,
    @Query('city') city?: string,
    @Query('favoritesOnly') favoritesOnly?: string,
    @Query('appliedOnly') appliedOnly?: string,
    @Query('page') page = 1,
    @Query('per_page') perPage = 20,
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

    return this.jobService.listJobs(
      filters,
      Number(page),
      Number(perPage),
      userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/state')
  @ApiOperation({ summary: 'Update job state', description: 'Marks a job as favorite, applied, or viewed for the authenticated user' })
  async setJobState(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: { isFavorite?: boolean; isApplied?: boolean; isViewed?: boolean },
  ) {
    const userId = req.user.id;
    return this.jobService.setJobState(userId, id, body);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get job statistics', description: 'Returns total jobs collected today grouped by source' })
  async getStats() {
    return this.jobService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID', description: 'Returns details of a specific job by its identifier' })
  async getJobById(@Param('id', ParseIntPipe) id: number) {
    const job = await this.jobService.getJobById(id);
    if (!job) {
      throw new NotFoundException('Job not found.');
    }
    return job;
  }

  @Post()
  @ApiOperation({ summary: 'Create job manually', description: 'Registers a new job in the database' })
  async createJob(@Body() body: any) {
    return this.jobService.createJob(body);
  }
}
