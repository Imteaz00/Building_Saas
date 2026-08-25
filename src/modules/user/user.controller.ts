import { Body, Controller, Get, Patch, Post } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
// @ApiTags('User')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  createUser(@Body() userDto: CreateUserDto) {
    return this.userService.createUser(userDto);
  }
}
