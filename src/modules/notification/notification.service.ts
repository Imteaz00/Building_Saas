import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotificationTemplate } from './entities/template.entity';
import { NotificationTemplateQueryParamsDto } from './dtos/template-query.dto';
import { NotificationTemplateResponseDto } from './dtos/template-response.dto';
import { UpdateNotificationTemplateDto } from './dtos/template.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
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
}
