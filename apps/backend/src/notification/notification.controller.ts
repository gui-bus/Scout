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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications', description: 'Returns all job notifications of the authenticated user sorted by date' })
  async listNotifications(@Request() req: { user: { id: number } }) {
    return this.notificationService.listNotifications(req.user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read', description: 'Sets the read status to true for all notifications of the user' })
  async markAllAsRead(@Request() req: { user: { id: number } }) {
    return this.notificationService.markAllAsRead(req.user.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark notification as read', description: 'Sets the read status to true for a specific notification' })
  async markAsRead(@Request() req: { user: { id: number } }, @Param('id', ParseIntPipe) id: number) {
    return this.notificationService.markAsRead(req.user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification', description: 'Removes a specific notification from the user history' })
  async deleteNotification(
    @Request() req: { user: { id: number } },
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationService.deleteNotification(req.user.id, id);
  }
}
