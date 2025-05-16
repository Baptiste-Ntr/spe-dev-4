import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Prisma } from '@prisma/client';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    // Récupération de tous les utilisateurs
    async findAllUsers() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                isTwoFactorEnabled: true,
                createdAt: true,
                blockedAt: true,
            }
        });
        return users;
    }

    // Récupération d'un utilisateur par son ID
    async findUserById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id }
        });
        if (!user) throw new NotFoundException('User not found');
        const { passwordHash, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    // Récupération d'un utilisateur par son email
    async findUserByEmail(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email }
        })

        return user;
    }

    // Creation 'un utilisateur
    async createUser(data: CreateUserDto) {
        const user = await this.prisma.user.create({
            data: {
                ...data,
                permissions: data.permissions ? { create: data.permissions } : undefined,
                invitationsSent: data.invitationsSent ? { create: data.invitationsSent } : undefined,
                invitationsReceived: data.invitationsReceived ? { create: data.invitationsReceived } : undefined,
                documentsUpdated: data.documentsUpdated ? { create: data.documentsUpdated } : undefined,
                // Création du dossier Home 
                ownedFolders: {
                    create: {
                        name: 'Home'
                    }
                }
            }
        });

        return user;
    }
    
    // Creation d'un utilisateur par un admin
    async createUserByAdmin(data: CreateUserByAdminDto) {
        const { password, ...userData } = data;

        const user = await this.prisma.user.create({
            data: {
                ...userData,
                permissions: data.permissions ? { create: data.permissions } : undefined,
                invitationsSent: data.invitationsSent ? { create: data.invitationsSent } : undefined,
                invitationsReceived: data.invitationsReceived ? { create: data.invitationsReceived } : undefined,
                documentsUpdated: data.documentsUpdated ? { create: data.documentsUpdated } : undefined,
                // Création du dossier Home 
                ownedFolders: {
                    create: {
                        name: 'Home'
                    }
                },
                // Hash du mot de passe
                passwordHash: await bcrypt.hash(password, 10)
            }
        });

        return user;
    }

    // Update un utilisateur
    async updateUser(id: string, data: UpdateUserDto) {

        console.log(id, data)

        const user = await this.prisma.user.update({
            where: { id },
            data: {
                ...data,
                permissions: data.permissions ? { update: data.permissions.map(p => ({ where: { id: p.id }, data: p })) } : undefined,
                invitationsSent: data.invitationsSent ? { update: data.invitationsSent.map(i => ({ where: { id: i.id }, data: i })) } : undefined,
                invitationsReceived: data.invitationsReceived ? { update: data.invitationsReceived.map(i => ({ where: { id: i.id }, data: i })) } : undefined,
                documentsUpdated: data.documentsUpdated ? { update: data.documentsUpdated.map(d => ({ where: { id: d.id }, data: d })) } : undefined,
            }
        })

        if (!user) throw new NotFoundException('User not found');

        return user;
    }

    // Suppression d'un utilisateur
    async deleteUser(id: string) {
        const user = await this.prisma.user.delete({
            where: { id }
        })

        return user;
    }

    // Bloque ou débloque un utilisateur
    async blockUser(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id }
        });
        
        if (!user) throw new NotFoundException('User not found');
        
        // Si l'utilisateur est déjà bloqué, on le débloque
        // Sinon on le bloque
        return await this.prisma.user.update({
            where: { id },
            data: { blockedAt: user.blockedAt ? null : new Date() }
        });
    }
}
