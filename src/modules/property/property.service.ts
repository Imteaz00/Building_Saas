import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Building } from './entities/building.entity';
import { BuildingDto, BuildingResponseDto } from './dtos/building.dto';
import { CompanyService } from '../company/company.service';
import { UnitDto, UnitResponseDto } from './dtos/unit.dto';
import { Unit } from './entities/unit.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,

    private readonly companyService: CompanyService, // Assuming you have a CompanyService to fetch company details
  ) {}

  async addBuilding(building: BuildingDto): Promise<BuildingResponseDto> {
    try {
      const company = await this.companyService.getCompanyById(
        building.companyId,
      );
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      building.companyId = company.id;

      const newBuilding = this.buildingRepository.create(building);
      const savedBuilding = await this.buildingRepository.save(newBuilding);
      if (!savedBuilding) {
        throw new Error('Building could not be saved');
      }

      return {
        id: savedBuilding.id,
        companyId: savedBuilding.company.id,
        name: savedBuilding.name,
        address: savedBuilding.address,
        buildingType: savedBuilding.buildingType,
        yearBuilt: savedBuilding.yearBuilt,
        floorCount: savedBuilding.floorCount,
        ownershipNotes: savedBuilding.ownershipNotes,
        status: savedBuilding.status,
      };
    } catch (error) {
      throw error;
    }
  }

  async addUnit(unit: UnitDto): Promise<UnitResponseDto> {
    try {
      const building = await this.buildingRepository.findOne({
        where: { id: unit.buildingId },
      });
      if (!building) {
        throw new NotFoundException('Building not found');
      }
      unit.buildingId = building.id;

      const newUnit = this.unitRepository.create(unit);
      const savedUnit = await this.unitRepository.save(newUnit);
      if (!savedUnit) {
        throw new Error('Unit could not be saved');
      }

      return {
        id: savedUnit.id,
        buildingId: savedUnit.building.id,
        unitNumber: savedUnit.unitNumber,
        unitType: savedUnit.unitType,
        floor: savedUnit.floor,
        size: savedUnit.size,
        sizeUnit: savedUnit.sizeUnit,
        bedroomCount: savedUnit.bedroomCount,
        bathroomCount: savedUnit.bathroomCount,
        occupancyStatus: savedUnit.occupancyStatus,
        unavailableReason: savedUnit.unavailableReason,
        expectedReturnDate: savedUnit.expectedReturnDate,
      };
    } catch (error) {
      throw error;
    }
  }
}
