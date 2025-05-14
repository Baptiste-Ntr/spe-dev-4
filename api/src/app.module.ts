import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TwoFactorAuthModule } from './2fa/2fa.module';
import { SocketModule } from './gateways/socket.module';
import { PrismaModule } from './prisma/prisma.module';
import { DocumentsModule } from './documents/documents.module';
import { FoldersModule } from './folders/folder.modules';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    TwoFactorAuthModule,
    SocketModule,
    PrismaModule,
    DocumentsModule,
    FoldersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
