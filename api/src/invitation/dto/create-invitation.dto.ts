import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';

export enum UserRole {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

export class CreateInvitationDto {
    @ApiProperty({
        example: 'user@example.com',
        description: 'Email de l\'utilisateur à inviter'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        enum: UserRole,
        example: UserRole.USER,
        description: 'Rôle de l\'utilisateur'
    })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
} 