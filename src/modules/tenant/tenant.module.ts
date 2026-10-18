import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantService } from './tenant.service';
import { Lease } from './entities/lease.entity';
import { Tenant } from './entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lease, Tenant])],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
