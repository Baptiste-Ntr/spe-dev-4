import { Controller, Post, Body, UseGuards, Req, Res, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.auth.guard';
import { JwtPreAccessGuard } from './jwt-pre-access.guard';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body: { email: string; password: string }, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.validateUser(body.email, body.password);
        const result = await this.authService.login(user);

        if (result.pre_access_token) {
            // Si 2FA est activé, on met le pre_access_token dans un cookie
            res.cookie('pre_access_token', result.pre_access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 300000 // 5 minutes
            });
            return { twoFactorEnabled: true };
        }

        // Si pas de 2FA, on met le token normal
        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1 heure
        });
        return { message: 'Logged in successfully' };
    }

    @Post('2fa/verify')
    @UseGuards(JwtPreAccessGuard)
    async verify2FA(@Req() req, @Body('code') code: string, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.verifyTwoFactorCode(req.user.sub, code);

        // On supprime le pre_access_token
        res.clearCookie('pre_access_token');

        // On met le vrai token
        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1 heure
        });

        return { message: '2FA verification successful' };
    }

    @Post('register')
async register(
    @Body() body: { email: string; password: string },
    @Res({ passthrough: true }) res: Response
) {
    try {
        // Cette méthode peut échouer (email déjà utilisé, etc.)
        const result = await this.authService.register(body);

        // Si nous arrivons ici, l'inscription a réussi
        // Définir le cookie comme dans login
        res.cookie('access_token', result.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000
        });
        
        // Renvoyer une réponse pour indiquer le succès
        return { 
            message: 'Registration successful',
            user: {
                email: body.email
            }
        };
    } catch (error) {
        throw error;
    }
}

    @Get('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Res({ passthrough: true }) res: Response) {
        return this.authService.logout(res);
    }
}
