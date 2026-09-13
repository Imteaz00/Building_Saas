import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';

import { UpdateUserDto, UserDto } from './dtos/user.dto';
import { UserService } from './user.service';
import { VerifyTokenDto } from './dtos/verify-token.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { AuthorizeGuard } from 'src/guards/authorize.guard';
import { LoginDto, LoginResponseDto } from './dtos/login.dto';
import { AuthService } from './services/auth.service';
import { AllowAnonymous } from 'src/decorators/allow-anonymous.decorator';
import { ActiveUser } from 'src/decorators/active-user.decorator';
import type { ActiveUserType } from 'src/interfaces/active-user.interface';
import { CompanyId } from 'src/decorators/company-id.decorator';

//   @ApiBearerAuth('Authorization')
//   @UseGuards(AuthorizeGuard)
@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('create')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Create a new user with a verification token' })
  async createUser(
    @Body() userDto: UserDto,
    @CompanyId() companyId: string,
  ): Promise<UserResponseDto> {
    return await this.userService.createUser(userDto, companyId);
  }

  @AllowAnonymous()
  @Patch('verify-token')
  @ApiOperation({ summary: 'Verify a user token' })
  async verifyToken(
    @Body() verifyTokenDto: VerifyTokenDto,
  ): Promise<{ accessToken: string; accessTokenExpiresAt: Date }> {
    return await this.userService.verifyToken(verifyTokenDto);
  }

  @Get('by-id/:userId')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: "Get a user's details by ID" })
  async getUserById(
    @Param('userId') userId: string,
    @Req() req: Request,
  ): Promise<UserResponseDto> {
    return await this.userService.getUserById(userId);
  }

  @Get('validate-username/:username')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Verify if a username exists' })
  async validateUsername(
    @Param('username') username: string,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<{ exists: string | false }> {
    const exists = await this.userService.validateUsername(
      username,
      activeUser,
    );
    return { exists };
  }

  @Patch('update')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: "Update a user's details including password" })
  async updateUser(
    @Body() user: UpdateUserDto,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<UserResponseDto> {
    return await this.userService.updateUser(user, activeUser);
  }

  @AllowAnonymous()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user and return an access token' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    return await this.authService.login(loginDto, req);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @AllowAnonymous()
  @ApiOperation({ summary: 'Refresh access token using a refresh token' })
  async refreshAccessToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ accessToken: string; accessTokenExpiresAt: Date }> {
    return await this.authService.refreshAccessToken(refreshToken);
  }
}
