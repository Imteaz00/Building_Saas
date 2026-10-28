import { Controller, Get, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { RoleService } from './role.service';
import type { ActiveUserType } from 'src/interfaces/active-user.interface';
import { ActiveUser } from 'src/decorators/active-user.decorator';
import { RoleResponseDto } from './role.dto';
import { convertToResponseDto } from 'src/utils/responseDto';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('user-roles')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Get the roles of the active user' })
  async getUserRoles(
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<RoleResponseDto[]> {
    const roles = await this.roleService.getUserRoles(
      activeUser.sub,
      activeUser.companyId,
    );
    return roles.map((role) => convertToResponseDto(RoleResponseDto, role));
  }
}
