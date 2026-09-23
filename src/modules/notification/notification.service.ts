import {
  Injectable,
  NotFoundException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { NotificationTemplate } from './entities/template.entity';
import { NotificationTemplateQueryParamsDto } from './dtos/template-query.dto';
import { NotificationTemplateResponseDto } from './dtos/template-response.dto';
import { UpdateNotificationTemplateDto } from './dtos/template.dto';
import { UserService } from '../user/user.service';
import { MailerService } from '@nestjs-modules/mailer';
import { NotificationEvent } from './entities/event.entity';
import { User } from '../user/entities/user.entity';
import { NotificationPreference } from './entities/preference.entity';
import { NotificationDelivery } from './entities/delivery.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,

    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,

    @InjectRepository(NotificationDelivery)
    private deliveryRepository: Repository<NotificationDelivery>,

    @InjectQueue('delivery-queue')
    private readonly deliveryQueue: Queue,

    private readonly userService: UserService,
    private readonly mailerService: MailerService,
  ) {}

  async getAllTemplates(
    query: NotificationTemplateQueryParamsDto,
  ): Promise<NotificationTemplateResponseDto[]> {
    const where: any = {};
    if (query.channel) where.channel = query.channel;
    if (query.eventKey) where.eventKey = query.eventKey;

    const templates = await this.templateRepository.find({ where });

    return templates.map((template) => ({
      id: template.id,
      channel: template.channel,
      eventKey: template.eventKey,
      subject: template.subject,
      body: template.body,
    }));
  }

  async getTemplateById(
    templateId: string,
  ): Promise<NotificationTemplateResponseDto> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });
    if (!template) {
      throw new NotFoundException(
        `Notification template with ID ${templateId} not found`,
      );
    }
    return {
      id: template.id,
      channel: template.channel,
      eventKey: template.eventKey,
      subject: template.subject,
      body: template.body,
    };
  }

  async updateTemplate(
    templateId: string,
    updateData: UpdateNotificationTemplateDto,
  ): Promise<NotificationTemplateResponseDto> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId },
    });
    if (!template) {
      throw new NotFoundException(
        `Notification template with ID ${templateId} not found`,
      );
    }

    template.subject = updateData.subject ?? template.subject;
    template.body = updateData.body ?? template.body;
    const updatedTemplate = await this.templateRepository.save(template);
    return {
      id: updatedTemplate.id,
      channel: updatedTemplate.channel,
      eventKey: updatedTemplate.eventKey,
      subject: updatedTemplate.subject,
      body: updatedTemplate.body,
    };
  }

  async sendVerificationEmail(
    userId: string,
    token: string,
    companyId: string,
  ): Promise<void> {
    const template = await this.templateRepository.findOne({
      where: {
        eventKey: 'user_verification',
        channel: 'email',
        company: { id: companyId },
      },
    });
    if (!template) {
      throw new NotFoundException(
        `Notification template for user verification email not found for company ID ${companyId}`,
      );
    }
    if (!template.subject) {
      throw new NotFoundException(
        'Email subject is not defined in the notification template for user verification email',
      );
    }
    if (!template.body.includes('{{token}}')) {
      throw new NotAcceptableException(
        'Email body does not contain the {{token}} placeholder in the notification template for user verification email',
      );
    }

    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.mailerService.sendMail({
      to: user.email,
      subject: template.subject,
      html: template.body.replace('{{token}}', token),
    });
  }

  async configureNotification(event: NotificationEvent): Promise<void> {
    const templates = await this.templateRepository.find({
      where: {
        eventKey: event.eventKey,
        company: { id: event.company.id },
      },
    });

    if (templates.length === 0) {
      console.warn(
        `No notification templates found for event key: ${event.eventKey} and company ID: ${event.company.id}`,
      );
      return;
    }

    const recipients = await this.getRecipients(event);
    if (recipients.length === 0) {
      console.warn(
        `No recipients found for event key: ${event.eventKey} and company ID: ${event.company.id}`,
      );
      return;
    }

    const preferences = await this.preferenceRepository.find({
      where: {
        user: {
          id: In(recipients.map((r) => r.id)),
          company: { id: event.company.id },
        },
        eventCategory: event.eventKey,
      },
    });

    const passiveDeliveries: Partial<NotificationDelivery>[] = [];

    for (const recipient of recipients) {
      const userPreferences = preferences.filter(
        (pref) => pref.user.id === recipient.id,
      );

      let status: NotificationDelivery['status'] = 'queued';
      let address: string | null = null;

      for (const template of templates) {
        const preference = userPreferences.find(
          (pref) => pref.eventCategory === template.eventKey,
        );

        if (preference && !preference.enabled) {
          status = 'suppressed';
        } else {
          switch (template.channel) {
            case 'email':
              address = recipient.email;
              break;
            case 'sms':
              address = recipient.phone;
              break;
            case 'in-app':
              address = recipient.id;
              break;
            default:
              continue;
          }
          if (!address) status = 'undeliverable';
        }
        const delivery: Partial<NotificationDelivery> = {
          event,
          template,
          recipient,
          recipientAddress: address,
          channel: template.channel,
          status,
          attemptCount: 0,
        };

        if (status === 'queued') {
          const savedDelivery = await this.deliveryRepository.save(delivery);
          await this.deliveryQueue.add(
            'process-delivery',
            {
              deliveryId: savedDelivery.id,
              channel: template.channel,
            },
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 1000,
              },
            },
          );
        } else {
          passiveDeliveries.push(delivery);
        }
      }
    }

    if (passiveDeliveries.length > 0) {
      await this.deliveryRepository.save(passiveDeliveries);
    }
  }

  async getRecipients(event: NotificationEvent): Promise<User[]> {
    switch (event.eventKey) {
      default:
        return [];
    }
  }

  async sendMail() {}
  async sendSMS() {}
  async sendInAppNotification() {}
}
