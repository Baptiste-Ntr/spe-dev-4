import { Controller, Get, Post, Patch, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { Request } from 'express';
import { User } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getUserNotifications(@Req() req: Request & { user: User }) {
        const notifications = await this.notificationsService.getUserNotifications(req.user.id);
        return notifications.map(notification => ({
            id: notification.id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            read: notification.read,
            timestamp: notification.createdAt,
            documentId: notification.documentId,
            documentTitle: notification.document?.title,
            senderId: notification.senderId,
            senderName: `${notification.sender.firstName} ${notification.sender.lastName}`,
            senderAvatar: null,
            userId: notification.userId,
            token: notification.token
        }));
    }

    @Get('unread-count')
    async getUnreadCount(@Req() req: Request & { user: User }) {
        return this.notificationsService.getUnreadCount(req.user.id);
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string, @Req() req: Request & { user: User }) {
        return this.notificationsService.markAsRead(id, req.user.id);
    }

    @Patch('read-all')
    async markAllAsRead(@Req() req: Request & { user: User }) {
        return this.notificationsService.markAllAsRead(req.user.id);
    }

    @Delete(':id')
    async deleteNotification(@Param('id') id: string, @Req() req: Request & { user: User }) {
        return this.notificationsService.deleteNotification(id, req.user.id);
    }
} 