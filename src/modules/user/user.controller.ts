import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
} from '@nestjs/swagger';

import { UserDto } from './dtos/user.dto';
import { UserService } from './user.service';
import { VerifyTokenDto } from './dtos/verify-token.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { AuthorizeGuard } from 'src/guards/authorize.guard';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user with a verification token' })
  async createUser(
    @Body() userDto: UserDto,
  ): Promise<{ user: UserResponseDto; token: string }> {
    return await this.userService.createUser(userDto);
  }

  @Patch('verify-token')
  @ApiOperation({ summary: 'Verify a user token' })
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto): Promise<boolean> {
    return await this.userService.verifyToken(verifyTokenDto);
  }

  @ApiBearerAuth('Authorization')
  @UseGuards(AuthorizeGuard)
  @Get('by-id/:userId')
  @ApiOperation({ summary: "Get a user's details by ID" })
  async getUserById(@Param('userId') userId: string): Promise<UserResponseDto> {
    return await this.userService.getUserById(userId);
  }

  @Get('validate-username/:username')
  @ApiOperation({ summary: 'Verify if a username exists' })
  async validateUsername(
    @Param('username') username: string,
  ): Promise<{ exists: boolean }> {
    const exists = await this.userService.validateUsername(username);
    return { exists };
  }

  //   @Patch('update-password/:userId')
  //   @ApiOperation({ summary: "Update a user's password" })
  //   async updatePassword(
  //     @Param('userId') userId: string,
  //     @Body('password') password: string,
  //   ): Promise<User> {
  //     return await this.userService.updatePassword(userId, password);
  //   }
}
