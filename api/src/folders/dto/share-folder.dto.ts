import { IsString, IsUUID, IsBoolean } from 'class-validator';

export class ShareFolderDto {
  @IsUUID()
  @IsString()
  userId: string;
  
  @IsBoolean()
  canEdit: boolean = false;
}