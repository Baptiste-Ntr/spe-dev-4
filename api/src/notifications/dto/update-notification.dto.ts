import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationDto {
    @ApiProperty({
        example: true,
        description: 'Indique si la notification a été lue',
        required: false
    })
    @IsBoolean()
    @IsOptional()
    isRead?: boolean;
} 