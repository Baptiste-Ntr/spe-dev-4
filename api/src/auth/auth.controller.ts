import { Controller, Post, Body, UseGuards, Req, Res, UnauthorizedException, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.auth.guard';
import { JwtPreAccessGuard } from './jwt-pre-access.guard';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @ApiOperation({ summary: 'Login user' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    example: 'user@example.com'
                },
                password: {
                    type: 'string',
                    example: 'password123'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'User successfully logged in',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Logged in successfully'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: '2FA required',
        schema: {
            type: 'object',
            properties: {
                twoFactorEnabled: {
                    type: 'boolean',
                    example: true
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    // Authentification
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

    // Vérification du code 2FA
    @ApiOperation({ summary: 'Verify 2FA code' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                code: {
                    type: 'string',
                    example: '123456'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: '2FA verification successful',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: '2FA verification successful'
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid 2FA code' })
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

    // Inscription
    @ApiOperation({ summary: 'Register new user' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    example: 'newuser@example.com'
                },
                password: {
                    type: 'string',
                    example: 'password123'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'User successfully registered',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Registration successful'
                },
                user: {
                    type: 'object',
                    properties: {
                        email: {
                            type: 'string',
                            example: 'newuser@example.com'
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Email already exists' })
    @Post('register')
        async register(
            @Body() body: { email: string; password: string },
            @Res({ passthrough: true }) res: Response
        ) {
            try {
                    const result = await this.authService.register(body);

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

    // Déconnexion
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({
        status: 200,
        description: 'User successfully logged out',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Logged out successfully'
                }
            }
        }
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Res({ passthrough: true }) res: Response) {
        return this.authService.logout(res);
    }

    @ApiOperation({ summary: 'Verify JWT token' })
    @ApiResponse({
        status: 200,
        description: 'Token is valid',
        schema: {
            type: 'object',
            properties: {
                valid: {
                    type: 'boolean',
                    example: true
                },
                user: {
                    type: 'object',
                    properties: {
                        userId: {
                            type: 'string',
                            example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        email: {
                            type: 'string',
                            example: 'user@example.com'
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Invalid token' })
    @ApiBearerAuth()
    @UseGuards(JwtPreAccessGuard)
    @Get('verify')
    async verifyToken() {
        return { valid: true };
    }
}
