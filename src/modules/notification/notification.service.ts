import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotificationTemplate } from './entities/template.entity';
import { NotificationTemplateQueryParamsDto } from './dtos/tamplate-query.dto';
import { NotificationTemplateResponseDto } from './dtos/template-response.dto';
import { NotificationTemplateDto } from './dtos/template.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private templateRepository: Repository<NotificationTemplate>,
  ) {}

  async getAllTemplates(
    query: NotificationTemplateQueryParamsDto,
  ): Promise<NotificationTemplateResponseDto[]> {
    const templates = await this.templateRepository.find({
      where: {
        channel: query.channel,
        eventKey: query.eventKey,
      },
    });

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
    updateData: Partial<NotificationTemplateDto>,
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
