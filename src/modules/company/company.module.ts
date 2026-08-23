import { Module } from '@nestjs/common';

import { CompanyController } from './company.controller';
import { Company } from './company.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [CompanyController],
  imports: [TypeOrmModule.forFeature([Company])],
})
export class CompanyModule {}
