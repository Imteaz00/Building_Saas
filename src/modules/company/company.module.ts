import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CompanyController } from './company.controller';
import { Company } from './company.entity';
import { CompanyService } from './company.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  controllers: [CompanyController],
  imports: [
    TypeOrmModule.forFeature([Company]),
    BullModule.registerQueue({ name: 'notification-queue' }),
  ],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
