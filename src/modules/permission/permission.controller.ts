import { Controller, Post, Body, Patch, Get } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ActiveUser } from 'src/decorators/active-user.decorator';
import type { ActiveUserType } from 'src/interfaces/active-user.interface';
import { UserPermissionDto } from './dtos/user-permission.dto';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('add-permission')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Add a permission to a user' })
  async addPermissionToUser(
    @Body() userPermissionDto: UserPermissionDto,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<void> {
    await this.permissionService.addPermissionToUser(
      userPermissionDto.userId,
      userPermissionDto.permissionCode,
      activeUser.companyId,
      activeUser.sub,
    );
  }

  @Patch('revoke-permission')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Revoke a permission from a user' })
  async revokePermissionFromUser(
    @Body() userPermissionDto: UserPermissionDto,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<void> {
    await this.permissionService.revokePermissionFromUser(
      userPermissionDto.userId,
      userPermissionDto.permissionCode,
      activeUser.companyId,
      activeUser.sub,
    );
  }

  @Get('self-permissions')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Get the permissions of the active user' })
  async getSelfPermissions(
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<string[]> {
    const userPermissions = await this.permissionService.getUserPermissions(
      activeUser.sub,
      activeUser.companyId,
    );
    return userPermissions.map((permission) => permission.code);
  }
}
