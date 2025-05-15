import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { InvitationService } from './invitation.service';

@Controller('invitation')
export class InvitationController {
    constructor(private readonly invitationService: InvitationService) { }

    @Post()
    async createInvitation(@Body() body: { documentId: string, invitedById: string, invitedToId: string }): Promise<any> {
        const { documentId, invitedById, invitedToId } = body;
        return await this.invitationService.createInvitation(documentId, invitedById, invitedToId);
    }

    @Get(':token')
    async getInvitation(@Param('token') token: string): Promise<any> {
        return await this.invitationService.getInvitation(token);
    }

    @Put(':token/accept')
    async acceptInvitation(@Param('token') token: string): Promise<any> {
        return await this.invitationService.acceptInvitation(token);
    }

    @Put(':token/decline')
    async declineInvitation(@Param('token') token: string): Promise<any> {
        return await this.invitationService.declineInvitation(token);
    }

    @Get('status/:token')
    async getInvitationStatus(@Param('token') token: string): Promise<any> {
        return await this.invitationService.getInvitationStatus(token);
    }

    @Get('user/:userId')
    async getInvitationsByUser(@Param('userId') userId: string): Promise<any> {
        return await this.invitationService.getInvitationsByUser(userId);
    }
}
