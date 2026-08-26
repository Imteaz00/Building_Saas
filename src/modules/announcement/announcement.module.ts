import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Announcement } from './annoumcement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Announcement])],
})
export class AnnouncementModule {}
