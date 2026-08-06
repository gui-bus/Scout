import { Controller, Post, Headers, UnauthorizedException, ConflictException, HttpCode, HttpStatus } from "@nestjs/common";
import { CollectService } from "./collect.service";

@Controller("api/collect")
export class CollectController {
  constructor(private readonly collectService: CollectService) {}

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  async triggerCollection(@Headers("authorization") authHeader?: string) {
    const secret = process.env.CRON_SECRET || "development_cron_secret";
    const expected = `Bearer ${secret}`;

    if (!authHeader || authHeader !== expected) {
      throw new UnauthorizedException("Unauthorized.");
    }

    if (this.collectService.getCollectingStatus()) {
      throw new ConflictException("Collection is already in progress.");
    }

    this.collectService.runCollection().catch(() => {});

    return { message: "Collection triggered." };
  }
}
