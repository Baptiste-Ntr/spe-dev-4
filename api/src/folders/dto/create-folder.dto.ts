import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsUUID()
  readonly parentId?: string;

  
}