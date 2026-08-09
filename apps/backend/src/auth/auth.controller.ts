import { Controller, Post, Get, Body, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post("login")
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get("filters")
  async getFilters(@Request() req: any) {
    return this.authService.getSavedFilters(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("filters")
  async saveFilters(@Request() req: any, @Body() body: { filters: any[] }) {
    return this.authService.updateSavedFilters(req.user.id, body.filters);
  }

  @UseGuards(JwtAuthGuard)
  @Get("resume")
  async getResume(@Request() req: any) {
    return this.authService.getResume(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("resume")
  async updateResume(@Request() req: any, @Body() body: any) {
    return this.authService.updateResume(req.user.id, body.resume);
  }
}
