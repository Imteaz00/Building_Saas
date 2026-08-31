import { Body, Controller, Post } from '@nestjs/common';
import { PropertyService } from './property.service';
import { BuildingDto, BuildingResponseDto } from './dtos/building.dto';
import { UnitDto, UnitResponseDto } from './dtos/unit.dto';

@Controller('property')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post('building')
  async addBuilding(
    @Body() buildingDto: BuildingDto,
  ): Promise<BuildingResponseDto> {
    return this.propertyService.addBuilding(buildingDto);
  }

  @Post('unit')
  async addUnit(@Body() unitDto: UnitDto): Promise<UnitResponseDto> {
    return this.propertyService.addUnit(unitDto);
  }
}
