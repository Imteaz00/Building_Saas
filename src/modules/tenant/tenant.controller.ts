import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { TenantDto, TenantResponseDto } from './dtos/tenant.dt0';
import { ActiveUser } from 'src/decorators/active-user.decorator';
import type { ActiveUserType } from 'src/interfaces/active-user.interface';
import { TenantService } from './tenant.service';
import { convertToResponseDto } from 'src/utils/responseDto';
import { LeaseResponseDto, LeaseDto } from './dtos/lease.dto';
import {
  LeaseChargeLineDto,
  LeaseChargeLineResponseDto,
} from './dtos/charge-line.dto';

@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post('create-tenant')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Create a new tenant' })
  async createTenant(
    @Body() tenantDto: TenantDto,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<TenantResponseDto> {
    return convertToResponseDto(
      TenantResponseDto,
      await this.tenantService.createTenant(tenantDto, activeUser.companyId),
    );
  }

  @Post('create-lease')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Create a new lease' })
  async createLease(
    @Body() leaseDto: LeaseDto,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<LeaseResponseDto> {
    return convertToResponseDto(
      LeaseResponseDto,
      await this.tenantService.createLease(leaseDto, activeUser.companyId),
    );
  }

  @Post('add-charge-line')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Add a new charge line to a lease' })
  async addChargeLine(
    @Body() chargeLineDto: LeaseChargeLineDto,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<LeaseChargeLineResponseDto> {
    return convertToResponseDto(
      LeaseChargeLineResponseDto,
      await this.tenantService.addChargeLine(
        chargeLineDto,
        activeUser.companyId,
      ),
    );
  }
}
