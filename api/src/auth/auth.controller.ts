import { Controller, Post, Body, Res, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from './jwt.auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            // On n'atteindra jamais cette ligne car validateUser lance déjà une exception
            // si l'utilisateur n'est pas trouvé ou si le mot de passe est incorrect
        }
        const { access_token } = await this.authService.login(user);
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000, // 1 hour
        });
        return { message: 'Logged in successfully' };
    }

    @Post('register')
    async register(@Body() body) {
        return this.authService.register(body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        return this.authService.logout(res);
    }
}
