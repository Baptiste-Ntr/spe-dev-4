import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ChatGateway } from '../gateways/chat.gateway';

@Module({
  providers: [PrismaService, ChatGateway], 
  exports: [PrismaService],
})
export class PrismaModule { }
