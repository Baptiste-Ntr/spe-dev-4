import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FoldersService } from './folder.service';
import { FolderController } from './folder.controller';
import { SocketModule } from '../gateways/socket.module';

@Module({
  imports: [PrismaModule, SocketModule],
  providers: [FoldersService],
  controllers: [FolderController],
  exports: [FoldersService],
})
export class FoldersModule {}