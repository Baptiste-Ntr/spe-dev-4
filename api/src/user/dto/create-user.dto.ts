import { Role, Permission, Invitation, Document } from "@prisma/client";
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    passwordHash: string;

    @IsString()
    @IsOptional()
    firstName?: string;

    @IsString()
    @IsOptional()
    lastName?: string;

    @IsEnum(Role)
    @IsOptional()
    role?: Role;

    @IsBoolean()
    @IsOptional()
    isTwoFactorEnabled?: boolean;

    @IsString()
    @IsOptional()
    twoFactorSecret?: string;

    @IsDateString()
    @IsOptional()
    blockedAt?: Date;

    @IsDateString()
    @IsOptional()
    createdAt?: Date;

    @IsDateString()
    @IsOptional()
    updatedAt?: Date;

    @IsArray()
    @IsOptional()
    permissions?: Permission[];

    @IsArray()
    @IsOptional()
    invitationsSent?: Invitation[];

    @IsArray()
    @IsOptional()
    invitationsReceived?: Invitation[];

    @IsArray()
    @IsOptional()
    documentsUpdated?: Document[];

}