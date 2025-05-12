import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userService.findUserByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Aucun compte trouvé avec cet email.');
        }
        const passwordOk = await bcrypt.compare(pass, user.passwordHash);
        if (!passwordOk) {
            throw new UnauthorizedException('Mot de passe incorrect.');
        }
        const { passwordHash, ...result } = user;
        return result;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

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
}
