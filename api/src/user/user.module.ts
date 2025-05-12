import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatGateway } from '../gateways/chat.gateway';

@Module({
  imports: [PrismaModule],
  providers: [UserService, ChatGateway],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule { }
