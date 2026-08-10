import {
  Controller,
  Get,
  Post,
  Headers,
  UnauthorizedException,
  ConflictException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CollectService } from './collect.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Collection')
@Controller('api/collect')
export class CollectController {
  constructor(private readonly collectService: CollectService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get collection status', description: 'Checks if there is an active job collection routine running' })
  async getStatus() {
    return { collecting: this.collectService.getCollectingStatus() };
  }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger collection routine', description: 'Starts the job scraping routine asynchronously (Requires CRON_SECRET token in the Authorization header)' })
  async triggerCollection(@Headers('authorization') authHeader?: string) {
    const secret = process.env.CRON_SECRET || 'development_cron_secret';
    const expected = `Bearer ${secret}`;

    if (!authHeader || authHeader !== expected) {
      throw new UnauthorizedException('Unauthorized.');
    }

    if (this.collectService.getCollectingStatus()) {
      throw new ConflictException('Collection is already in progress.');
    }

    this.collectService.runCollection().catch(() => {});

    return { message: 'Collection triggered.' };
  }
}
