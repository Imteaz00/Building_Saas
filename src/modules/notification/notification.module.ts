import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationTemplate } from './entities/template.entity';
import { NotificationDelivery } from './entities/delivery.entity';
import { NotificationEvent } from './entities/event.entity';
import { NotificationPreference } from './entities/preference.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationPreference,
      NotificationDelivery,
      NotificationEvent,
      NotificationTemplate,
    ]),
  ],
})
export class NotificationModule {}
