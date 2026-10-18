import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { NotificationService } from '../notification.service';
import { NotificationEvent } from '../entities/event.entity';
import { NOTIFICATION_EVENTS } from 'src/constants/contants';

@Processor('notification-queue')
export class NotificationConsumer extends WorkerHost {
  constructor(
    private readonly notificationService: NotificationService,

    @InjectRepository(NotificationEvent)
    private eventRepository: Repository<NotificationEvent>,
  ) {
    super();
  }

  async process(job: Job) {
    let event: NotificationEvent;
    switch (job.name) {
      case NOTIFICATION_EVENTS.SEND_VERIFICATION_EMAIL:
        const { userId, token, companyId } = job.data;
        await this.notificationService.sendVerificationEmail(
          userId,
          token,
          companyId,
        );
        break;

      case NOTIFICATION_EVENTS.SETUP_TEMPLATES:
        await this.notificationService.setupNotificationTemplates(
          job.data.companyId,
        );
        break;

      case 'send-notification':
        const data = job.data;
        event = await this.eventRepository.save({
          company: { id: data.companyId },
          eventKey: data.eventKey,
          targetType: data.targetType,
          targetId: data.targetId,
          raisedByModule: data.raisedByModule,
          payload: data.payload,
        });

        await this.notificationService.configureNotification(event);
        break;

      case NOTIFICATION_EVENTS.BUILDING_ANNOUNCEMENT:
        event = await this.eventRepository.save(job.data);
        await this.notificationService.sendBuildingAnnouncement(event);
        break;

      default:
        console.warn(`No handler for job name: ${job.name}`);
    }
  }
}
