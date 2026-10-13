import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { PropertyService } from './property.service';
import {
  BuildingDto,
  BuildingQueryDto,
  BuildingResponseDto,
} from './dtos/building.dto';
import { UnitDto, UnitQueryDto, UnitResponseDto } from './dtos/unit.dto';
import { ActiveUser } from 'src/decorators/active-user.decorator';
import type { ActiveUserType } from 'src/interfaces/active-user.interface';
import {
  DefaultChargeDto,
  DefaultChargeResponseDto,
} from './dtos/default-charge.dto';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post('building/add')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Add a new building' })
  async addBuilding(
    @Body() buildingDto: BuildingDto,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<BuildingResponseDto> {
    return this.propertyService.addBuilding(buildingDto, activeUser);
  }

  @Get('buildings')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Get all buildings' })
  async getBuildings(
    @ActiveUser() activeUser: ActiveUserType,
    @Query() query: BuildingQueryDto,
  ): Promise<BuildingResponseDto[]> {
    return this.propertyService.getBuildings(activeUser, query);
  }

  @Post('unit/add')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Add a new unit' })
  async addUnit(
    @Body() unitDto: UnitDto,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<UnitResponseDto> {
    return this.propertyService.addUnit(unitDto, activeUser);
  }

  @Get('units')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Get all units' })
  async getUnits(
    @ActiveUser() activeUser: ActiveUserType,
    @Query() query: UnitQueryDto,
  ): Promise<UnitResponseDto[]> {
    return this.propertyService.getUnits(activeUser, query);
  }

  @Post('default-charge/add')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Add a new default charge' })
  async addDefaultCharge(
    @Body() defaultChargeDto: DefaultChargeDto,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<DefaultChargeResponseDto> {
    return this.propertyService.addDefaultCharge(defaultChargeDto, activeUser);
  }
}
