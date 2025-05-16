import { Injectable } from '@nestjs/common';
import { generateSecretCode2FA, verifySecretCode2FA } from 'lib/generateSecretCode2FA';
import { UserService } from 'src/user/user.service';
@Injectable()
export class TwoFactorAuthService {
    constructor(private readonly userService: UserService) { }

    // Permet de générer un code secret pour la 2fa
    async generateSecretCode() {
        const { secret, qrCode } = await generateSecretCode2FA()
        return { secret, qrCode }
    }

    // Permet de vérifier le code secret pour la 2fa
    async verifySecretCode(secret: string, token: string) {
        const isValid = verifySecretCode2FA(secret, token)
        return isValid
    }

    // Permet d'activer la 2fa
    async enable2FA(userId: string, secret: string, token: string) {
        const isValid = verifySecretCode2FA(secret, token)
        if (isValid) {
            const updateUser = await this.userService.updateUser(userId, {
                isTwoFactorEnabled: true,
                twoFactorSecret: secret
            })
            return updateUser
        }
        throw new Error('Invalid secret code')
    }

    // Permet de désactiver la 2fa
    async disable2FA(userId: string) {
        const user = await this.userService.findUserById(userId)
        if (!user) {
            throw new Error('User not found')
        }
        if (!user.isTwoFactorEnabled) {
            throw new Error('Two-Factor Authentication is not enabled')
        }
        const updateUser = await this.userService.updateUser(userId, {
            isTwoFactorEnabled: false,
            twoFactorSecret: undefined
        })
        return updateUser
    }
}
