import { IsString, IsOptional } from "class-validator";

export class UpdateDocumentDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsString()
    @IsOptional()
    folderId?: string;

    @IsString()
    @IsOptional()
    updatedById?: string;

    @IsString()
    @IsOptional()
    updatedAt?: Date;
}