import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Role } from 'src/modules/role/role.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
})
export class RoleModule {}
