import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Invitations')
@Controller('invitation')
export class InvitationController {
    constructor(private readonly invitationService: InvitationService) { }

    @ApiOperation({ summary: 'Create invitation' })
    @ApiResponse({ status: 201, description: 'Invitation successfully created' })
    @ApiBearerAuth()
    @Post()
    async createInvitation(@Body() body: { documentId: string, invitedById: string, invitedToId: string }): Promise<any> {
        const { documentId, invitedById, invitedToId } = body;
        return await this.invitationService.createInvitation(documentId, invitedById, invitedToId);
    }

    @ApiOperation({ summary: 'Get invitation by token' })
    @ApiResponse({ status: 200, description: 'Return invitation by token' })
    @ApiBearerAuth()
    @Get(':token')
    async getInvitation(@Param('token') token: string): Promise<any> {
        return await this.invitationService.getInvitation(token);
    }

    @ApiOperation({ summary: 'Accept invitation' })
    @ApiResponse({ status: 200, description: 'Invitation successfully accepted' })
    @ApiBearerAuth()
    @Put(':token/accept')
    async acceptInvitation(@Param('token') token: string): Promise<any> {
        return await this.invitationService.acceptInvitation(token);
    }

    @ApiOperation({ summary: 'Decline invitation' })
    @ApiResponse({ status: 200, description: 'Invitation successfully declined' })
    @ApiBearerAuth()
    @Put(':token/decline')
    async declineInvitation(@Param('token') token: string): Promise<any> {
        return await this.invitationService.declineInvitation(token);
    }

    @ApiOperation({ summary: 'Get invitation status' })
    @ApiResponse({ status: 200, description: 'Return invitation status' })
    @ApiBearerAuth()
    @Get('status/:token')
    async getInvitationStatus(@Param('token') token: string): Promise<any> {
        return await this.invitationService.getInvitationStatus(token);
    }

    @ApiOperation({ summary: 'Get invitations by user' })
    @ApiResponse({ status: 200, description: 'Return invitations by user' })
    @ApiBearerAuth()
    @Get('user/:userId')
    async getInvitationsByUser(@Param('userId') userId: string): Promise<any> {
        return await this.invitationService.getInvitationsByUser(userId);
    }
}
