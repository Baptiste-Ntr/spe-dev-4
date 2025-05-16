import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @ApiOperation({ summary: 'Create new notification' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['SHARE', 'MENTION', 'UPDATE'],
                    example: 'SHARE'
                },
                message: {
                    type: 'string',
                    example: 'John Doe a partagé un document avec vous'
                },
                resourceId: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000'
                },
                resourceType: {
                    type: 'string',
                    enum: ['DOCUMENT', 'FOLDER'],
                    example: 'DOCUMENT'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Notification successfully created',
        schema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000'
                },
                type: {
                    type: 'string',
                    enum: ['SHARE', 'MENTION', 'UPDATE'],
                    example: 'SHARE'
                },
                message: {
                    type: 'string',
                    example: 'John Doe a partagé un document avec vous'
                },
                resourceId: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000'
                },
                resourceType: {
                    type: 'string',
                    enum: ['DOCUMENT', 'FOLDER'],
                    example: 'DOCUMENT'
                },
                isRead: {
                    type: 'boolean',
                    example: false
                },
                createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-03-20T10:00:00Z'
                }
            }
        }
    })
    @ApiBearerAuth()
    @Post()
    create(@Body() createNotificationDto: CreateNotificationDto) {
        return this.notificationsService.create(createNotificationDto);
    }

    @ApiOperation({ summary: 'Get all notifications' })
    @ApiResponse({
        status: 200,
        description: 'Return all notifications',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: '123e4567-e89b-12d3-a456-426614174000'
                    },
                    type: {
                        type: 'string',
                        enum: ['SHARE', 'MENTION', 'UPDATE'],
                        example: 'SHARE'
                    },
                    message: {
                        type: 'string',
                        example: 'John Doe a partagé un document avec vous'
                    },
                    resourceId: {
                        type: 'string',
                        example: '123e4567-e89b-12d3-a456-426614174000'
                    },
                    resourceType: {
                        type: 'string',
                        enum: ['DOCUMENT', 'FOLDER'],
                        example: 'DOCUMENT'
                    },
                    isRead: {
                        type: 'boolean',
                        example: false
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-03-20T10:00:00Z'
                    }
                }
            }
        }
    })
    @ApiBearerAuth()
    @Get()
    findAll(@Req() req) {
        return this.notificationsService.findAll(req.user.userId);
    }

    @ApiOperation({ summary: 'Get notification by ID' })
    @ApiParam({
        name: 'id',
        type: 'string',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: 200,
        description: 'Return notification by ID',
        schema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000'
                },
                type: {
                    type: 'string',
                    enum: ['SHARE', 'MENTION', 'UPDATE'],
                    example: 'SHARE'
                },
                message: {
                    type: 'string',
                    example: 'John Doe a partagé un document avec vous'
                },
                resourceId: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000'
                },
                resourceType: {
                    type: 'string',
                    enum: ['DOCUMENT', 'FOLDER'],
                    example: 'DOCUMENT'
                },
                isRead: {
                    type: 'boolean',
                    example: false
                },
                createdAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-03-20T10:00:00Z'
                }
            }
        }
    })
    @ApiBearerAuth()
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.notificationsService.findOne(id);
    }

    @ApiOperation({ summary: 'Update notification' })
    @ApiParam({
        name: 'id',
        type: 'string',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                isRead: {
                    type: 'boolean',
                    example: true
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Notification successfully updated',
        schema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000'
                },
                isRead: {
                    type: 'boolean',
                    example: true
                },
                updatedAt: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-03-20T10:00:00Z'
                }
            }
        }
    })
    @ApiBearerAuth()
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
        return this.notificationsService.update(id, updateNotificationDto);
    }

    @ApiOperation({ summary: 'Delete notification' })
    @ApiParam({
        name: 'id',
        type: 'string',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: 200,
        description: 'Notification successfully deleted',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Notification deleted successfully'
                }
            }
        }
    })
    @ApiBearerAuth()
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.notificationsService.remove(id);
    }
} 