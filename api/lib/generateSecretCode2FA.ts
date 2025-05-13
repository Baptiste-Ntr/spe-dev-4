import * as speakeasy from "speakeasy"
import * as qrcode from "qrcode"

export const generateSecretCode2FA = async () => {
    const secret = speakeasy.generateSecret({ length: 20 })
    if (!secret.otpauth_url) throw new Error('Failed to generate OTP auth URL')
    const qrCode = await qrcode.toDataURL(secret.otpauth_url)
    return { secret, qrCode }
}

export const verifySecretCode2FA = (secret: string, token: string) => {
    return speakeasy.totp.verify({ secret, token, encoding: 'base32' })
}
