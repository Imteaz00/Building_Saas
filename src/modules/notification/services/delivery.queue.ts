import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { NotAcceptableException, NotFoundException } from '@nestjs/common';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';

import { NotificationDelivery } from '../entities/delivery.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Processor('delivery-queue')
export class DeliveryQueueProcessor extends WorkerHost {
  constructor(
    @InjectRepository(NotificationDelivery)
    private deliveryRepository: Repository<NotificationDelivery>,

    private readonly mailerService: MailerService,
  ) {
    super();
  }

  async process(job: Job<{ deliveryId: string; channel: string }>) {
    switch (job.name) {
      case 'process-delivery':
        const delivery = await this.deliveryRepository.findOne({
          where: { id: job.data.deliveryId },
          relations: { template: true, event: true },
        });
        if (!delivery) {
          throw new NotFoundException(
            `Delivery with ID ${job.data.deliveryId} not found`,
          );
        }

        try {
          await this.deliver({ delivery, channel: job.data.channel });
          delivery.status = 'sent';
          await this.deliveryRepository.save(delivery);
          return { success: true, message: 'Delivery processed successfully' };
        } catch (error: any) {
          delivery.status = 'failed';
          delivery.failureReason = error.message || 'Unknown error';
          delivery.attemptCount = job.attemptsMade;
          await this.deliveryRepository.save(delivery);
          throw error;
        }

      default:
        console.warn(`No handler for job name: ${job.name}`);
    }
  }

  async deliver({
    delivery,
    channel,
  }: {
    delivery: NotificationDelivery;
    channel: string;
  }) {
    switch (channel) {
      case 'email':
        this.sendEmail(delivery);
        break;

      case 'sms':
        this.sendSMS();
        break;

      case 'in-app':
        this.sendInAppNotification();
        break;

      default:
        console.warn(`Unknown delivery channel: ${channel}`);
    }
  }

  async sendEmail(delivery: NotificationDelivery) {
    try {
      if (!delivery.recipientAddress) {
        throw new NotAcceptableException(
          `Recipient address for delivery ID ${delivery.id} not found`,
        );
      }
      if (!delivery.template?.subject) {
        throw new NotAcceptableException(
          `Template for delivery ID ${delivery.id} not found`,
        );
      }

      // compile body with payload
      const compiledBody = delivery.template.body.replace(
        /\{\{\s*([\w-]+)\s*\}\}/g,
        (match, key) => String(delivery.event.payload?.[key] ?? match),
      );

      await this.mailerService.sendMail({
        to: delivery.recipientAddress,
        subject: delivery.template.subject,
        html: compiledBody,
      });
    } catch (error) {
      throw error;
    }
  }

  async sendSMS() {
    console.log('Sending SMS notification...');
  }
  async sendInAppNotification() {
    console.log('Sending in-app notification...');
  }
}
