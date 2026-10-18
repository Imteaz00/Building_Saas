import {
  Injectable,
  NotFoundException,
  NotAcceptableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { NotificationTemplate } from './entities/template.entity';
import { NotificationTemplateQueryParamsDto } from './dtos/template-query.dto';
import {
  NotificationTemplateResponseDto,
  UpdateNotificationTemplateDto,
} from './dtos/template.dto';
import { UserService } from '../user/user.service';
import { MailerService } from '@nestjs-modules/mailer';
import { NotificationEvent } from './entities/event.entity';
import { User } from '../user/entities/user.entity';
import { NotificationPreference } from './entities/preference.entity';
import { NotificationDelivery } from './entities/delivery.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ActiveUserType } from 'src/interfaces/active-user.interface';
import { convertToResponseDto } from 'src/utils/responseDto';
import { AnnouncementService } from '../announcement/announcement.service';
import { TenantService } from '../tenant/tenant.service';
import { DELIVERY_EVENTS, NOTIFICATION_EVENTS } from 'src/constants/contants';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,

    @InjectRepository(NotificationPreference)
    private preferenceRepository: Repository<NotificationPreference>,

    @InjectRepository(NotificationDelivery)
    private deliveryRepository: Repository<NotificationDelivery>,

    @InjectRepository(NotificationEvent)
    private eventRepository: Repository<NotificationEvent>,

    @InjectQueue('delivery-queue')
    private readonly deliveryQueue: Queue,

    private readonly userService: UserService,
    private readonly mailerService: MailerService,
    private readonly announcementService: AnnouncementService,
    private readonly tenantService: TenantService,
  ) {}

  async getAllTemplates(
    query: NotificationTemplateQueryParamsDto,
    activeUser: ActiveUserType,
  ): Promise<NotificationTemplateResponseDto[]> {
    const where: any = { company: { id: activeUser.companyId } };
    if (query.channel) where.channel = query.channel;
    if (query.eventKey) where.eventKey = query.eventKey;

    const templates = await this.templateRepository.find({ where });

    return templates.map((template) =>
      convertToResponseDto(NotificationTemplateResponseDto, template),
    );
  }

  async getTemplateById(
    templateId: string,
    activeUser: ActiveUserType,
  ): Promise<NotificationTemplateResponseDto> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId, company: { id: activeUser.companyId } },
    });
    if (!template) {
      throw new NotFoundException(
        `Notification template with ID ${templateId} not found`,
      );
    }
    return convertToResponseDto(NotificationTemplateResponseDto, template);
  }

  //   async createTemplate(
  //     templateData: NotificationTemplateDto,
  //     activeUser: ActiveUserType,
  //   ): Promise<NotificationTemplateResponseDto> {
  //     const newTemplate = this.templateRepository.create({
  //       ...templateData,
  //       company: { id: activeUser.companyId },
  //     });
  //     const savedTemplate = await this.templateRepository.save(newTemplate);
  //     if (!savedTemplate) {
  //       throw new Error('Failed to create notification template');
  //     }
  //     return {
  //       id: savedTemplate.id,
  //       channel: savedTemplate.channel,
  //       eventKey: savedTemplate.eventKey,
  //       subject: savedTemplate.subject,
  //       body: savedTemplate.body,
  //     };
  //   }

  async updateTemplate(
    templateId: string,
    updateData: UpdateNotificationTemplateDto,
    activeUser: ActiveUserType,
  ): Promise<NotificationTemplateResponseDto> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId, company: { id: activeUser.companyId } },
    });
    if (!template) {
      throw new NotFoundException(
        `Notification template with ID ${templateId} not found`,
      );
    }

    template.subject = updateData.subject ?? template.subject;
    template.body = updateData.body ?? template.body;
    const updatedTemplate = await this.templateRepository.save(template);

    if (!updatedTemplate) {
      throw new Error('Failed to update notification template');
    }
    return convertToResponseDto(
      NotificationTemplateResponseDto,
      updatedTemplate,
    );
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
      relations: { user: true },
    });

    const passiveDeliveries: Partial<NotificationDelivery>[] = [];

    for (const recipient of recipients) {
      const userPreferences = preferences.filter(
        (pref) => pref.user.id === recipient.id,
      );

      for (const template of templates) {
        let status: NotificationDelivery['status'] = 'queued';
        let address: string | null = null;
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

  async setupNotificationTemplates(companyId: string): Promise<void> {
    const defaultTemplates = await this.templateRepository.find({
      where: { company: { slug: 'default-company' } },
    });

    const templatesToCreate = defaultTemplates.map((defaultTemplate) => ({
      ...defaultTemplate,
      company: { id: companyId },
      id: undefined, // Ensure a new ID is generated
    }));
    const savedTemplates =
      await this.templateRepository.save(templatesToCreate);
    if (!savedTemplates || savedTemplates.length === 0) {
      throw new Error(
        'Failed to create notification templates for the company',
      );
    }
  }

  async sendBuildingAnnouncement(event: NotificationEvent): Promise<void> {
    try {
      const [emailTemplate, inAppTemplate] = await Promise.all([
        this.templateRepository.findOne({
          where: {
            eventKey: NOTIFICATION_EVENTS.BUILDING_ANNOUNCEMENT,
            channel: DELIVERY_EVENTS.EMAIL,
            company: { id: event.company.id },
          },
        }),
        this.templateRepository.findOne({
          where: {
            eventKey: NOTIFICATION_EVENTS.BUILDING_ANNOUNCEMENT,
            company: { id: event.company.id },
            channel: DELIVERY_EVENTS.IN_APP,
          },
        }),
      ]);

      if (!emailTemplate || !inAppTemplate) {
        throw new NotFoundException('Failed to find notification templates');
      }

      const announcement = await this.announcementService.getAnnouncementById(
        event.targetId,
      );
      if (!announcement) {
        throw new NotFoundException(
          `Announcement with ID ${event.targetId} not found`,
        );
      }

      const tenants = await this.tenantService.getActiveTenantsByUnits(
        announcement.units,
      );
      if (!tenants || tenants.length === 0) {
        throw new NotFoundException(
          'No active tenants found for the announcement units',
        );
      }

      const tenantEmailDeliveries = tenants.map((tenant) =>
        this.deliveryRepository.create({
          event: { id: event.id },
          tenant: { id: tenant.id },
          recipientAddress: tenant.primaryEmail,
          channel: DELIVERY_EVENTS.EMAIL,
          status: 'queued',
          attemptCount: 0,
          template: { id: emailTemplate.id },
        }),
      );

      const savedTenantEmailDeliveries = await this.deliveryRepository.save(
        tenantEmailDeliveries,
      );

      await this.deliveryQueue.addBulk(
        savedTenantEmailDeliveries.map((delivery) => ({
          name: DELIVERY_EVENTS.EMAIL,
          data: {
            deliveryId: delivery.id,
            subject: emailTemplate.subject,
            body: emailTemplate.body,
            payload: event.payload,
          },
        })),
      );

      const users = await this.userService.getUsersByTenantIds(
        tenants.map((tenant) => tenant.id),
      );

      const userInAppDeliveries = users.map((user) => {
        return this.deliveryRepository.create({
          event: { id: event.id },
          recipient: { id: user.id },
          tenant: { id: user.tenant?.id },
          channel: DELIVERY_EVENTS.IN_APP,
          status: 'queued',
          attemptCount: 0,
          template: { id: inAppTemplate.id },
        });
      });

      const savedUserInAppDeliveries =
        await this.deliveryRepository.save(userInAppDeliveries);

      // call inapp cron job

      const notificationPreferences = await this.preferenceRepository.find({
        where: {
          user: { id: In(users.map((user) => user.id)) },
          tenant: { id: In(tenants.map((tenant) => tenant.id)) },
          channel: DELIVERY_EVENTS.EMAIL,
          enabled: true,
        },
        relations: { user: true, tenant: true },
      });

      const userEmailDeliveries = notificationPreferences.map((preference) => {
        return this.deliveryRepository.create({
          event: { id: event.id },
          recipient: { id: preference.user.id },
          tenant: { id: preference.tenant?.id },
          recipientAddress: preference.user.email,
          channel: DELIVERY_EVENTS.EMAIL,
          status: 'queued',
          attemptCount: 0,
          template: { id: emailTemplate.id },
        });
      });

      const savedUserEmailDeliveries =
        await this.deliveryRepository.save(userEmailDeliveries);

      await this.deliveryQueue.addBulk(
        savedUserEmailDeliveries.map((delivery) => ({
          name: DELIVERY_EVENTS.EMAIL,
          data: {
            deliveryId: delivery.id,
            subject: emailTemplate.subject,
            body: emailTemplate.body,
            payload: event.payload,
          },
        })),
      );
    } catch (error) {
      await this.deliveryRepository.upsert(
        {
          event: { id: event.id },
          channel: DELIVERY_EVENTS.IN_APP,
          status: 'undeliverable',
          failureReason: error instanceof Error ? error.message : String(error),
          attemptCount: 0,
        },
        ['event', 'channel'],
      );
      throw error;
    }
  }

  async retryDelivery(
    deliveryId: string,
    activeUser: ActiveUserType,
  ): Promise<void> {
    const delivery = await this.deliveryRepository.findOne({
      where: { id: deliveryId },
      relations: { event: { company: true }, template: true },
    });
    if (!delivery || delivery.event.company.id !== activeUser.companyId) {
      throw new NotFoundException(
        `Notification delivery with ID ${deliveryId} not found`,
      );
    }

    await this.deliveryQueue.add(delivery.channel, {
      deliveryId: delivery.id,
      subject: delivery.template?.subject,
      body: delivery.template?.body,
      payload: delivery.event.payload,
    });
  }

  async retryEventDeliveries(
    eventId: string,
    activeUser: ActiveUserType,
  ): Promise<void> {
    const deliveries = await this.deliveryRepository.find({
      where: {
        event: { id: eventId, company: { id: activeUser.companyId } },
        status: 'failed',
      },
      relations: { event: true, template: true },
    });

    if (!deliveries || deliveries.length === 0) {
      throw new NotFoundException(
        `No failed notification deliveries found for event ID ${eventId}`,
      );
    }

    switch (deliveries[0].event.eventKey) {
      case NOTIFICATION_EVENTS.BUILDING_ANNOUNCEMENT:
        await this.sendBuildingAnnouncement(deliveries[0].event);
        break;
      default:
        throw new NotFoundException(
          `No retry logic defined for event key: ${deliveries[0].event.eventKey}`,
        );
    }
  }
}
