import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async createNotification(data: {
        type: NotificationType;
        title: string;
        message: string;
        userId: string;
        senderId: string;
        documentId?: string;
        token?: string;
    }) {
        return this.prisma.notification.create({
            data: {
                type: data.type,
                title: data.title,
                message: data.message,
                user: { connect: { id: data.userId } },
                sender: { connect: { id: data.senderId } },
                ...(data.documentId && {
                    document: { connect: { id: data.documentId } },
                }),
                ...(data.token && {
                    token: data.token,
                }),
            },
            include: {
                sender: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                document: {
                    select: {
                        title: true,
                    },
                },
            },
        });
    }

    async getUserNotifications(userId: string) {
        return this.prisma.notification.findMany({
            where: {
                userId,
            },
            include: {
                sender: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                document: {
                    select: {
                        title: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async markAsRead(id: string, userId: string) {
        return this.prisma.notification.update({
            where: {
                id,
                userId,
            },
            data: {
                read: true,
            },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: {
                userId,
                read: false,
            },
            data: {
                read: true,
            },
        });
    }

    async deleteNotification(id: string, userId: string) {
        return this.prisma.notification.delete({
            where: {
                id,
                userId,
            },
        });
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notification.count({
            where: {
                userId,
                read: false,
            },
        });
    }
} 