import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { TenantDto, TenantResponseDto } from './dtos/tenant.dt0';
import { Tenant } from './entities/tenant.entity';
import { Lease } from './entities/lease.entity';
import { convertToResponseDto } from 'src/utils/responseDto';
import { LeaseDto } from './dtos/lease.dto';
import { PropertyService } from '../property/property.service';
import { LeaseChargeLineDto } from './dtos/charge-line.dto';
import { LeaseChargeLine } from './entities/charge.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Lease)
    private leaseRepository: Repository<Lease>,
    @InjectRepository(LeaseChargeLine)
    private leaseChargeLineRepository: Repository<LeaseChargeLine>,

    private readonly propertyService: PropertyService,
  ) {}

  async createTenant(tenantDto: TenantDto, companyId: string): Promise<Tenant> {
    const tenant = this.tenantRepository.create({
      ...tenantDto,
      company: { id: companyId },
    });
    return this.tenantRepository.save(tenant);
  }

  async getActiveTenantsByUnits(
    unitIds: string[],
  ): Promise<TenantResponseDto[]> {
    const leases = await this.leaseRepository.find({
      where: {
        unit: { id: In(unitIds) },
        status: 'active',
      },
      relations: { tenant: true },
    });
    const tenantIds = leases.map((lease) => lease.tenant.id);
    const tenants = await this.tenantRepository.find({
      where: {
        id: In(tenantIds),
      },
    });
    return tenants.map((tenant) =>
      convertToResponseDto(TenantResponseDto, tenant),
    );
  }

  async createLease(leaseDto: LeaseDto, companyId: string): Promise<Lease> {
    const [unitId] = await this.propertyService.checkCompanyUnitsAssociation(
      companyId,
      [leaseDto.unitId],
    );
    if (!unitId) {
      throw new NotFoundException(`Unit with ID ${leaseDto.unitId} not found`);
    }

    const tenant = await this.tenantRepository.findOne({
      where: { id: leaseDto.tenantId, company: { id: companyId } },
    });

    if (!tenant) {
      throw new NotFoundException(
        `Tenant with ID ${leaseDto.tenantId} not found`,
      );
    }

    const lease = this.leaseRepository.create({
      ...leaseDto,
      unit: { id: leaseDto.unitId },
      tenant: { id: leaseDto.tenantId },
      status: 'draft',
    });
    return this.leaseRepository.save(lease);
  }

  async addChargeLine(
    chargeLineDto: LeaseChargeLineDto,
    companyId: string,
  ): Promise<LeaseChargeLine> {
    const lease = await this.leaseRepository.findOne({
      where: {
        id: chargeLineDto.leaseId,
        unit: { building: { company: { id: companyId } } },
      },
    });
    if (!lease) {
      throw new NotFoundException(
        `Lease with ID ${chargeLineDto.leaseId} not found`,
      );
    }

    const chargeLine = this.leaseChargeLineRepository.create({
      ...chargeLineDto,
      lease: { id: chargeLineDto.leaseId },
    });
    return this.leaseChargeLineRepository.save(chargeLine);
  }
}
