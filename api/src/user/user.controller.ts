import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Request, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';

interface RequestWithUser extends Request {
    user: {
        userId: string;
        email: string;
    };
}

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllUsers() {
        return this.userService.findAllUsers();
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Req() req: RequestWithUser) {
        const user = await this.userService.findUserById(req.user.userId);
        return user;
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findUserById(@Param('id') id: string) {
        return this.userService.findUserById(id);
    }


    @UseGuards(JwtAuthGuard)
    @Post()
    async createUser(@Body() data: CreateUserDto) {
        return this.userService.createUser(data);
    }
    
    @UseGuards(JwtAuthGuard)
    @Post('by-admin')
    async createUserByAdmin(@Body() data: CreateUserByAdminDto) {
        return this.userService.createUserByAdmin(data);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('update/:id')
    async updateUser(@Param('id') id: string, @Body() data: UpdateUserDto) {
        return this.userService.updateUser(id, data);
    }
    
    @UseGuards(JwtAuthGuard)
    @Patch(':id/block')
    async blockUser(@Param('id') id: string) {
        return this.userService.blockUser(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('delete/:id')
    async deleteUser(@Param('id') id: string) {
        return this.userService.deleteUser(id);
    }
}
