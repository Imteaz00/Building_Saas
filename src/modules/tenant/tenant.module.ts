import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TenantService } from './tenant.service';
import { Lease } from './entities/lease.entity';
import { Tenant } from './entities/tenant.entity';
import { TenantController } from './tenant.controller';
import { PropertyModule } from '../property/property.module';
import { LeaseChargeLine } from './entities/charge.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lease, Tenant, LeaseChargeLine]),
    PropertyModule,
  ],
  providers: [TenantService],
  exports: [TenantService],
  controllers: [TenantController],
})
export class TenantModule {}
