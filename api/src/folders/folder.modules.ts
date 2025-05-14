import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FoldersService } from './folder.service';
import { FolderController } from './folder.controller';

@Module({
  imports: [PrismaModule],
  providers: [FoldersService],
  controllers: [FolderController],
  exports: [FoldersService],
})
export class FoldersModule {}