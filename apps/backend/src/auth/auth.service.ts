import { Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../prisma.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(body: any) {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException("Email and password are required.");
    }

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException("User already exists.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return this.generateToken(user);
  }

  async login(body: any) {
    const { email, password } = body;
    if (!email || !password) {
      throw new BadRequestException("Email and password are required.");
    }

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException("Invalid email or password.");
    }

    return this.generateToken(user);
  }

  private generateToken(user: any) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  async getSavedFilters(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { savedFilters: true },
    });
    return user?.savedFilters ? JSON.parse(user.savedFilters) : [];
  }

  async updateSavedFilters(userId: number, filters: any[]) {
    if (filters.length > 3) {
      throw new BadRequestException("You can only save up to 3 filter combinations.");
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        savedFilters: JSON.stringify(filters),
      },
      select: { savedFilters: true },
    });
    return updated.savedFilters ? JSON.parse(updated.savedFilters) : [];
  }
}
