import { IsString, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsUUID()
  folderId?: string;
  
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType = DocumentType.TEXT;
}
