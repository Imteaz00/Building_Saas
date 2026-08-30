import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationTemplate } from './entities/template.entity';
import { NotificationDelivery } from './entities/delivery.entity';
import { NotificationEvent } from './entities/event.entity';
import { NotificationPreference } from './entities/preference.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationPreference,
      NotificationDelivery,
      NotificationEvent,
      NotificationTemplate,
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
})
export class NotificationModule {}
