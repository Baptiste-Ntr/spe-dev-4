import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Request, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { CreateUserByAdminDto } from './dto/create-user-by-admin.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';

interface RequestWithUser extends Request {
    user: {
        userId: string;
        email: string;
    };
}

@ApiTags('Users')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({
        status: 200,
        description: 'Return all users',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        example: '123e4567-e89b-12d3-a456-426614174000'
                    },
                    email: {
                        type: 'string',
                        example: 'user@example.com'
                    },
                    firstName: {
                        type: 'string',
                        example: 'John'
                    },
                    lastName: {
                        type: 'string',
                        example: 'Doe'
                    },
                    role: {
                        type: 'string',
                        enum: ['USER', 'ADMIN'],
                        example: 'USER'
                    },
                    isTwoFactorEnabled: {
                        type: 'boolean',
                        example: false
                    }
                }
            }
        }
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get()
    async findAllUsers() {
        return this.userService.findAllUsers();
    }

    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({
        status: 200,
        description: 'Return current user profile',
        schema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000'
                },
                email: {
                    type: 'string',
                    example: 'user@example.com'
                },
                firstName: {
                    type: 'string',
                    example: 'John'
                },
                lastName: {
                    type: 'string',
                    example: 'Doe'
                },
                role: {
                    type: 'string',
                    enum: ['USER', 'ADMIN'],
                    example: 'USER'
                },
                isTwoFactorEnabled: {
                    type: 'boolean',
                    example: false
                }
            }
        }
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@Req() req: RequestWithUser) {
        const user = await this.userService.findUserById(req.user.userId);
        return user;
    }

    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({
        name: 'id',
        type: 'string',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: 200,
        description: 'Return user by ID',
        schema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000'
                },
                email: {
                    type: 'string',
                    example: 'user@example.com'
                },
                firstName: {
                    type: 'string',
                    example: 'John'
                },
                lastName: {
                    type: 'string',
                    example: 'Doe'
                },
                role: {
                    type: 'string',
                    enum: ['USER', 'ADMIN'],
                    example: 'USER'
                },
                isTwoFactorEnabled: {
                    type: 'boolean',
                    example: false
                }
            }
        }
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findUserById(@Param('id') id: string) {
        return this.userService.findUserById(id);
    }

    @ApiOperation({ summary: 'Create new user' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    example: 'newuser@example.com'
                },
                passwordHash: {
                    type: 'string',
                    example: 'hashedPassword123'
                },
                firstName: {
                    type: 'string',
                    example: 'John'
                },
                lastName: {
                    type: 'string',
                    example: 'Doe'
                },
                role: {
                    type: 'string',
                    enum: ['USER', 'ADMIN'],
                    example: 'USER'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'User successfully created',
        schema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000'
                },
                email: {
                    type: 'string',
                    example: 'newuser@example.com'
                },
                firstName: {
                    type: 'string',
                    example: 'John'
                },
                lastName: {
                    type: 'string',
                    example: 'Doe'
                },
                role: {
                    type: 'string',
                    enum: ['USER', 'ADMIN'],
                    example: 'USER'
                }
            }
        }
    })
    @ApiBearerAuth()
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

    @ApiOperation({ summary: 'Update user' })
    @ApiParam({
        name: 'id',
        type: 'string',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: {
                    type: 'string',
                    example: 'updated@example.com'
                },
                firstName: {
                    type: 'string',
                    example: 'John'
                },
                lastName: {
                    type: 'string',
                    example: 'Doe'
                },
                role: {
                    type: 'string',
                    enum: ['USER', 'ADMIN'],
                    example: 'USER'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'User successfully updated',
        schema: {
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000'
                },
                email: {
                    type: 'string',
                    example: 'updated@example.com'
                },
                firstName: {
                    type: 'string',
                    example: 'John'
                },
                lastName: {
                    type: 'string',
                    example: 'Doe'
                },
                role: {
                    type: 'string',
                    enum: ['USER', 'ADMIN'],
                    example: 'USER'
                }
            }
        }
    })
    @ApiBearerAuth()
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

    @ApiOperation({ summary: 'Delete user' })
    @ApiParam({
        name: 'id',
        type: 'string',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    @ApiResponse({
        status: 200,
        description: 'User successfully deleted',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'User deleted successfully'
                }
            }
        }
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Delete('delete/:id')
    async deleteUser(@Param('id') id: string) {
        return this.userService.deleteUser(id);
    }
}
