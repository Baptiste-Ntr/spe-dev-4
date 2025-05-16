import { Controller, Get, Post, Body } from '@nestjs/common';
import { TwoFactorAuthService } from './2fa.service';

@Controller('2fa')
export class TwoFactorAuthController {
    constructor(private readonly twoFactorAuthService: TwoFactorAuthService) { }

    // Permet de générer un code secret pour la 2fa
    @Get('generate-secret-code')
    async generateSecretCode() {
        return this.twoFactorAuthService.generateSecretCode()
    }

    // Permet de vérifier le code secret pour la 2fa
    @Post('verify-secret-code')
    async verifySecretCode(@Body() body: { secretKey: string, verificationCode: string }) {
        // console.log(body)
        return this.twoFactorAuthService.verifySecretCode(body.secretKey, body.verificationCode)
    }

    // Permet d'activer la 2fa
    @Post('enable-2fa')
    async enable2FA(@Body() body: { secretKey: string, verificationCode: string, userId: string }) {
        return this.twoFactorAuthService.enable2FA(body.userId, body.secretKey, body.verificationCode)
    }

    // Permet de désactiver la 2fa
    @Post('disable-2fa')
    async disable2FA(@Body() body: { userId: string }) {
        return this.twoFactorAuthService.disable2FA(body.userId)
    }


}