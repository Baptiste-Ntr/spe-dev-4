import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(createNotificationDto: CreateNotificationDto) {
        return this.prisma.notification.create({
            data: {
                type: createNotificationDto.type,
                message: createNotificationDto.message,
                resourceId: createNotificationDto.resourceId,
                resourceType: createNotificationDto.resourceType,
                isRead: false
            }
        });
    }

    async findAll(userId: string) {
        return this.prisma.notification.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    async findOne(id: string) {
        return this.prisma.notification.findUnique({
            where: { id }
        });
    }

    async update(id: string, updateNotificationDto: UpdateNotificationDto) {
        return this.prisma.notification.update({
            where: { id },
            data: updateNotificationDto
        });
    }

    async remove(id: string) {
        await this.prisma.notification.delete({
            where: { id }
        });
        return { message: 'Notification deleted successfully' };
    }

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