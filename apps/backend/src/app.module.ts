import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma.module";
import { AuthModule } from "./auth/auth.module";
import { JobService } from "./job.service";
import { CollectService } from "./collect.service";
import { JobController } from "./job.controller";
import { CollectController } from "./collect.controller";

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [JobController, CollectController],
  providers: [JobService, CollectService],
})
export class AppModule {}
