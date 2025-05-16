import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import * as speakeasy from 'speakeasy';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) { }

    // Vérifie si l'utilisateur existe et si le mot de passe est 
    // correct. Si oui, retourne l'utilisateur sans le mot de passe
    // Sinon, lance une exception UnauthorizedException
    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Aucun compte trouvé avec cet email.');
        }
        const passwordOk = await bcrypt.compare(pass, user.passwordHash);
        if (!passwordOk) {
            throw new UnauthorizedException('Mot de passe incorrect.');
        }
        if (user.blockedAt) {
            throw new UnauthorizedException('Ce compte est bloqué.');
        }
        const { passwordHash, ...result } = user;
        return result;
    }

    // Permet de se connecter
    async login(user: any) {
        const payload = { email: user.email, sub: user.id, isTwoFactorEnabled: user.isTwoFactorEnabled };
        if (user.isTwoFactorEnabled) {
            return {
                pre_access_token: this.jwtService.sign(payload),
                twoFactorEnabled: true
            };
        }
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    // Vérifie le code 2FA
    // Si le code est correct, retourne un token JWT
    async verifyTwoFactorCode(userId: string, code: string) {
        const user = await this.userService.findUserById(userId);
        if (!user || !user.twoFactorSecret) {
            throw new UnauthorizedException('2FA not configured');
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: code,
            window: 1, 
        });

        if (!verified) {
            throw new UnauthorizedException('Invalid 2FA code');
        }

        const payload = { email: user.email, sub: user.id, isTwoFactorEnabled: true };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    // Permet de s'inscrire
    async register(user: any) {
        // Vérifier si l'email existe déjà
        const existing = await this.userService.findUserByEmail(user.email);
        if (existing) {
            throw new ConflictException('This email is already used.');
        }
        if (!user.email || !user.password) {
            throw new BadRequestException('Email and password required.');
        }
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = await this.userService.createUser({
            email: user.email,
            passwordHash: hashedPassword,
        });
        return this.login(newUser);
    }
    
    // Permet de se déconnecter
    async logout(res: Response) {
        // On supprime le cookie de l'utilisateur
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/'
        });
        return { message: 'Déconnexion réussie' };
    }
}
