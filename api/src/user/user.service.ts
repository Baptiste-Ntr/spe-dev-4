import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async findAllUsers() {
        const users = await this.prisma.user.findMany();
        return users;
    }

    async findUserById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id }
        })

        return user;
    }

    async createUser(data: CreateUserDto) {
        const user = await this.prisma.user.create({
            data: {
                ...data,
                permissions: data.permissions ? { create: data.permissions } : undefined,
                invitationsSent: data.invitationsSent ? { create: data.invitationsSent } : undefined,
                invitationsReceived: data.invitationsReceived ? { create: data.invitationsReceived } : undefined,
                documentsUpdated: data.documentsUpdated ? { create: data.documentsUpdated } : undefined,
            }
        })

        return user;
    }

    async updateUser(id: string, data: UpdateUserDto) {
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

        return user;
    }

    async deleteUser(id: string) {
        const user = await this.prisma.user.delete({
            where: { id }
        })

        return user;
    }
}
