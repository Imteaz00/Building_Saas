import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { UpdateUserDto, UserDto } from './dtos/user.dto';
import { UserService } from './user.service';
import { VerifyTokenDto } from './dtos/verify-token.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { AuthorizeGuard } from 'src/guards/authorize.guard';
import { LoginDto, LoginResponseDto } from './dtos/login.dto';
import { AuthService } from './services/auth.service';
import { AllowAnonymous } from 'src/decorators/allow-anonymous.decorator';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

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

  @Patch('update')
  @ApiOperation({ summary: "Update a user's details including password" })
  async updateUser(@Body() user: UpdateUserDto): Promise<UserResponseDto> {
    return await this.userService.updateUser(user);
  }

  @AllowAnonymous()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user and return an access token' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using a refresh token' })
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ accessToken: string; accessTokenExpiresAt: Date }> {
    return await this.authService.refreshAccessToken(refreshToken);
  }
}
