import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async listNotifications(@Request() req: { user: { id: number } }) {
    return this.notificationService.listNotifications(req.user.id);
  }

  @Post('read-all')
  async markAllAsRead(@Request() req: { user: { id: number } }) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Post(':id/read')
  async markAsRead(@Request() req: { user: { id: number } }, @Param('id', ParseIntPipe) id: number) {
    return this.notificationService.markAsRead(req.user.id, id);
  }

  @Delete(':id')
  async deleteNotification(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationService.deleteNotification(req.user.id, id);
  }
}
