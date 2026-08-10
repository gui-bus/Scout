import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user', description: 'Registers a new user account in the portal' })
  async register(@Body() body: Record<string, string>) {
    return this.authService.register(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login', description: 'Authenticates a user and returns a JWT access token' })
  async login(@Body() body: Record<string, string>) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'User profile', description: 'Returns the profile details of the currently authenticated user' })
  async getProfile(@Request() req: { user: { id: number; email: string } }) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('filters')
  @ApiOperation({ summary: 'Get saved filters', description: 'Lists the search query and filter combinations saved by the authenticated user' })
  async getFilters(@Request() req: { user: { id: number } }) {
    return this.authService.getSavedFilters(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('filters')
  @ApiOperation({ summary: 'Update saved filters', description: 'Saves new filter combinations for the authenticated user (Maximum of 3)' })
  async saveFilters(@Request() req: { user: { id: number } }, @Body() body: { filters: Record<string, unknown>[] }) {
    return this.authService.updateSavedFilters(req.user.id, body.filters);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('resume')
  @ApiOperation({ summary: 'Get Lume resume', description: 'Retrieves the Lume resume JSON associated with the authenticated user' })
  async getResume(@Request() req: { user: { id: number } }) {
    return this.authService.getResume(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post('resume')
  @ApiOperation({ summary: 'Update Lume resume', description: 'Saves or overwrites the Lume resume JSON for the authenticated user' })
  async updateResume(@Request() req: { user: { id: number } }, @Body() body: { resume: Record<string, unknown> }) {
    return this.authService.updateResume(req.user.id, body.resume);
  }
}
