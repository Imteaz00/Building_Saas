import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bullmq';

import { NotificationTemplate } from './entities/template.entity';
import { NotificationDelivery } from './entities/delivery.entity';
import { NotificationEvent } from './entities/event.entity';
import { NotificationPreference } from './entities/preference.entity';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { UserModule } from '../user/user.module';
import { NotificationConsumer } from './services/notification.consumer';
import { DeliveryQueueProcessor } from './services/delivery.queue';
import { AnnouncementModule } from '../announcement/announcement.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationPreference,
      NotificationDelivery,
      NotificationEvent,
      NotificationTemplate,
    ]),
    UserModule,
    AnnouncementModule,
    TenantModule,
    MailerModule,
    BullModule.registerQueue({
      name: 'notification-queue',
    }),
    BullModule.registerQueue({
      name: 'delivery-queue',
    }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationConsumer,
    DeliveryQueueProcessor,
  ],
})
export class NotificationModule {}
