import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '@prisma/client';

export enum ResourceType {
    DOCUMENT = 'DOCUMENT',
    FOLDER = 'FOLDER'
}

export class CreateNotificationDto {
    @ApiProperty({
        enum: NotificationType,
        example: NotificationType.DOCUMENT_UPDATE,
        description: 'Type de notification'
    })
    @IsEnum(NotificationType)
    @IsNotEmpty()
    type: NotificationType;

    @ApiProperty({
        example: 'John Doe a partagé un document avec vous',
        description: 'Message de la notification'
    })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID de la ressource concernée'
    })
    @IsUUID()
    @IsNotEmpty()
    resourceId: string;

    @ApiProperty({
        enum: ResourceType,
        example: ResourceType.DOCUMENT,
        description: 'Type de ressource concernée'
    })
    @IsEnum(ResourceType)
    @IsNotEmpty()
    resourceType: ResourceType;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID de l\'utilisateur qui reçoit la notification'
    })
    @IsUUID()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID de l\'utilisateur qui envoie la notification'
    })
    @IsUUID()
    @IsNotEmpty()
    senderId: string;
} 