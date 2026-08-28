import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { VerifyTokenDto } from './dtos/verify-token.dto';
import { CreateUserResponseDto } from './dtos/create-user-response.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user with a verification token' })
  async createUser(
    @Body() userDto: CreateUserDto,
  ): Promise<CreateUserResponseDto> {
    return await this.userService.createUser(userDto);
  }

  @Patch('verify-token')
  @ApiOperation({ summary: 'Verify a user token' })
  async verifyToken(@Body() verifyTokenDto: VerifyTokenDto): Promise<boolean> {
    return await this.userService.verifyToken(verifyTokenDto);
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
