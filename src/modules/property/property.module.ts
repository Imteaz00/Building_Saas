import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Unit } from './entities/unit.entity';
import { Building } from './entities/building.entity';
import { UnitDefaultCharge } from './entities/default-charge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Building, Unit, UnitDefaultCharge])],
})
export class PropertyModule {}
