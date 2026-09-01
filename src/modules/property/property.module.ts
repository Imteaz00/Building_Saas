import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Unit } from './entities/unit.entity';
import { Building } from './entities/building.entity';
import { UnitDefaultCharge } from './entities/default-charge.entity';
import { PropertyController } from './property.controller';
import { PropertyService } from './property.service';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Building, Unit, UnitDefaultCharge]),
    CompanyModule,
  ],
  controllers: [PropertyController],
  providers: [PropertyService],
})
export class PropertyModule {}
