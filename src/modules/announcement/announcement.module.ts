import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Announcement } from './announcement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Announcement])],
})
export class AnnouncementModule {}
