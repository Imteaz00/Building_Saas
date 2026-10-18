import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { TenantResponseDto } from './dtos/tenant.dt0';
import { Tenant } from './entities/tenant.entity';
import { Lease } from './entities/lease.entity';
import { convertToResponseDto } from 'src/utils/responseDto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(Lease)
    private leaseRepository: Repository<Lease>,
  ) {}

  async getActiveTenantsByUnits(
    unitIds: string[],
  ): Promise<TenantResponseDto[]> {
    const leases = await this.leaseRepository.find({
      where: {
        unit: { id: In(unitIds) },
        status: 'active',
      },
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
}
