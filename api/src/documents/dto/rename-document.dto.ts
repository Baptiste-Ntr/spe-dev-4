import { IsString } from 'class-validator';

export class RenameDocumentDto {
  @IsString()
  title: string;
}
