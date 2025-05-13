import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FoldersService } from './folder.service';
import { FoldersController } from './folder.controller';

@Module({
  imports: [PrismaModule],
  providers: [FoldersService],
  controllers: [FoldersController],
  exports: [FoldersService],
})
export class FoldersModule {}