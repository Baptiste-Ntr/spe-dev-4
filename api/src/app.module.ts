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
import { FolderController } from './folders/folder.controller';
import { InvitationModule } from './invitation/invitation.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    TwoFactorAuthModule,
    SocketModule,
    DocumentsModule,
    FoldersModule,
    InvitationModule,
    NotificationsModule,
  ],
  controllers: [AppController, FolderController],
  providers: [AppService],
})
export class AppModule { }
