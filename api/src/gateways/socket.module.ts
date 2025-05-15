import { Module } from '@nestjs/common';
import { CollaborationGateway } from './collaboration.gateway';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [CollaborationGateway],
    exports: [CollaborationGateway]
})
export class SocketModule { }