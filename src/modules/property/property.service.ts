import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';

import { Building } from './entities/building.entity';
import {
  BuildingDto,
  BuildingQueryDto,
  BuildingResponseDto,
} from './dtos/building.dto';
import { UnitDto, UnitQueryDto, UnitResponseDto } from './dtos/unit.dto';
import { Unit } from './entities/unit.entity';
import { ActiveUserType } from 'src/interfaces/active-user.interface';
import {
  DefaultChargeDto,
  DefaultChargeResponseDto,
} from './dtos/default-charge.dto';
import { UnitDefaultCharge } from './entities/default-charge.entity';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(UnitDefaultCharge)
    private readonly defaultChargeRepository: Repository<UnitDefaultCharge>,
  ) {}

  async addBuilding(
    building: BuildingDto,
    activeUser: ActiveUserType,
  ): Promise<BuildingResponseDto> {
    try {
      const newBuilding = this.buildingRepository.create({
        ...building,
        company: { id: activeUser.companyId }, // Associate the building with the company of the active user
      });
      const savedBuilding = await this.buildingRepository.save(newBuilding);
      if (!savedBuilding) {
        throw new Error('Building could not be saved');
      }

      return new BuildingResponseDto(savedBuilding);
    } catch (error) {
      throw error;
    }
  }

  async getBuildings(
    activeUser: ActiveUserType,
    query: BuildingQueryDto,
  ): Promise<BuildingResponseDto[]> {
    const where: any = { company: { id: activeUser.companyId } };
    if (query.name) where.name = ILike(`%${query.name}%`);
    if (query.address) where.address = ILike(`%${query.address}%`);
    if (query.buildingType)
      where.buildingType = ILike(`%${query.buildingType}%`);
    if (query.status) where.status = ILike(`%${query.status}%`);
    if (query.yearBuilt) where.yearBuilt = query.yearBuilt;
    if (query.floorCount) where.floorCount = query.floorCount;
    if (query.ownershipNotes)
      where.ownershipNotes = ILike(`%${query.ownershipNotes}%`);

    const buildings = await this.buildingRepository.find({
      where,
      take: query.limit ? query.limit : 10,
      skip: query.offset ? query.offset : 0,
    });

    return buildings.map((building) => new BuildingResponseDto(building));
  }

  async addUnit(
    unit: UnitDto,
    activeUser: ActiveUserType,
  ): Promise<UnitResponseDto> {
    try {
      const building = await this.buildingRepository.findOne({
        where: { id: unit.buildingId, company: { id: activeUser.companyId } },
      });
      if (!building) {
        throw new NotFoundException('Building not found');
      }

      const newUnit = this.unitRepository.create({
        ...unit,
        building: { id: building.id },
      });
      const savedUnit = await this.unitRepository.save(newUnit);
      if (!savedUnit) {
        throw new Error('Unit could not be saved');
      }

      return new UnitResponseDto(savedUnit);
    } catch (error) {
      throw error;
    }
  }

  async getUnits(
    activeUser: ActiveUserType,
    query: UnitQueryDto,
  ): Promise<UnitResponseDto[]> {
    const where: any = { building: { company: { id: activeUser.companyId } } };
    if (query.unitNumber) where.unitNumber = ILike(`%${query.unitNumber}%`);
    if (query.unitType) where.unitType = ILike(`%${query.unitType}%`);
    if (query.floor) where.floor = query.floor;
    if (query.size) where.size = query.size;
    if (query.sizeUnit) where.sizeUnit = ILike(`%${query.sizeUnit}%`);
    if (query.bedroomCount) where.bedroomCount = query.bedroomCount;
    if (query.bathroomCount) where.bathroomCount = query.bathroomCount;
    if (query.occupancyStatus)
      where.occupancyStatus = ILike(`%${query.occupancyStatus}%`);
    if (query.unavailableReason)
      where.unavailableReason = ILike(`%${query.unavailableReason}%`);
    if (query.expectedReturnDate)
      where.expectedReturnDate = query.expectedReturnDate;

    const units = await this.unitRepository.find({ where });

    return units.map((unit) => new UnitResponseDto(unit));
  }

  async addDefaultCharge(
    defaultCharge: DefaultChargeDto,
    activeUser: ActiveUserType,
  ): Promise<DefaultChargeResponseDto> {
    const unit = await this.unitRepository.findOne({
      where: { id: defaultCharge.unitId },
      relations: { building: { company: true } },
      select: { building: { company: { id: true } } },
    });

    if (!unit || unit.building.company.id !== activeUser.companyId) {
      throw new NotFoundException('Unit not found');
    }

    const newDefaultCharge = this.defaultChargeRepository.create({
      ...defaultCharge,
      unit: { id: unit.id },
    });

    const savedDefaultCharge =
      await this.defaultChargeRepository.save(newDefaultCharge);
    if (!savedDefaultCharge) {
      throw new Error('Default charge could not be saved');
    }

    return new DefaultChargeResponseDto(savedDefaultCharge);
  }
}
