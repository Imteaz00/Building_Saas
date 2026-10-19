import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Announcement } from './announcement.entity';
import { AnnouncementController } from './announcement.controller';
import { AnnouncementService } from './announcement.service';
import { PropertyModule } from '../property/property.module';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([Announcement]),
    PropertyModule,
    BullModule.registerQueue({ name: 'notification-queue' }),
  ],
  controllers: [AnnouncementController],
  providers: [AnnouncementService],
  exports: [AnnouncementService],
})
export class AnnouncementModule {}
