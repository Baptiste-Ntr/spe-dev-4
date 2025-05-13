import { Module } from '@nestjs/common';
import { TwoFactorAuthService } from './2fa.service';
import { TwoFactorAuthController } from './2fa.controller';
import { UserModule } from 'src/user/user.module';
@Module({
  providers: [TwoFactorAuthService],
  controllers: [TwoFactorAuthController],
  imports: [UserModule]
})
export class TwoFactorAuthModule { }
