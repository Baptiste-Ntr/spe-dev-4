import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtPreAccessGuard extends AuthGuard('jwt') {
    constructor(private jwtService: JwtService) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const preAccessToken = request.cookies.pre_access_token;

        if (!preAccessToken) {
            throw new UnauthorizedException('No pre-access token found');
        }

        try {
            const payload = await this.jwtService.verifyAsync(preAccessToken, {
                secret: process.env.JWT_SECRET
            });

            // Vérifier que c'est bien un pre_access_token
            if (!payload.isTwoFactorEnabled) {
                throw new UnauthorizedException('Invalid pre-access token');
            }

            request['user'] = payload;
            return true;
        } catch {
            throw new UnauthorizedException('Invalid pre-access token');
        }
    }
} 