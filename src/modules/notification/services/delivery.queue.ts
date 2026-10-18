import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job, UnrecoverableError } from 'bullmq';
import { Repository } from 'typeorm';

import { NotificationDelivery } from '../entities/delivery.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { DELIVERY_EVENTS } from 'src/constants/contants';

@Processor('delivery-queue')
export class DeliveryQueueProcessor extends WorkerHost {
  constructor(
    @InjectRepository(NotificationDelivery)
    private deliveryRepository: Repository<NotificationDelivery>,

    private readonly mailerService: MailerService,
  ) {
    super();
  }

  async process(
    job: Job<{
      deliveryId: string;
      subject: string;
      body: string;
      payload: Record<string, any>;
    }>,
  ) {
    switch (job.name) {
      case DELIVERY_EVENTS.EMAIL:
        const emailDelivery = await this.deliveryRepository.findOne({
          where: { id: job.data.deliveryId, channel: 'email' },
        });
        if (!emailDelivery) {
          throw new UnrecoverableError(
            `Email delivery with id ${job.data.deliveryId} not found`,
          );
        }

        await this.sendEmail(
          emailDelivery,
          job.data.subject,
          job.data.body,
          job.data.payload,
        );
        break;
      default:
        console.warn(`No handler for job name: ${job.name}`);
        throw new UnrecoverableError(`No handler for job name: ${job.name}`);
    }
  }

  async sendEmail(
    delivery: NotificationDelivery,
    subject: string,
    body: string,
    payload: Record<string, any>,
  ) {
    if (!delivery.recipientAddress || !subject || !body || !payload) {
      throw new UnrecoverableError('Recipient address is missing');
    }

    // compile body with payload
    const compiledBody = body.replace(/\{\{\s*([\w-]+)\s*\}\}/g, (match, key) =>
      String(payload[key] ?? match),
    );

    const compiledSubject = subject.replace(
      /\{\{\s*([\w-]+)\s*\}\}/g,
      (match, key) => String(payload[key] ?? match),
    );

    const mailResult = await this.mailerService.sendMail({
      to: delivery.recipientAddress,
      subject: compiledSubject,
      html: compiledBody,
    });

    //throw error if mailResult is not successful
    if (
      !mailResult ||
      !mailResult.accepted ||
      mailResult.accepted.length === 0
    ) {
      throw new Error('Failed to send email');
    }
  }

  async sendSMS() {
    console.log('Sending SMS notification...');
  }
  async sendInAppNotification() {
    console.log('Sending in-app notification...');
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    await this.deliveryRepository.update(job.data.deliveryId, {
      status: 'sent',
    });
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job, error: Error) {
    await this.deliveryRepository.update(job.data.deliveryId, {
      status: 'failed',
      failureReason: error.message,
    });
  }

  @OnWorkerEvent('active')
  async onAdded(job: Job) {
    await this.deliveryRepository.update(job.data.deliveryId, {
      attemptCount: job.attemptsMade,
      lastAttemptAt: new Date(),
    });
  }
}
