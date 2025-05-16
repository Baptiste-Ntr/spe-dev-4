import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum InvitationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

export class UpdateInvitationDto {
    @ApiProperty({
        enum: InvitationStatus,
        example: InvitationStatus.ACCEPTED,
        description: 'Statut de l\'invitation',
        required: false
    })
    @IsEnum(InvitationStatus)
    @IsOptional()
    status?: InvitationStatus;
} 