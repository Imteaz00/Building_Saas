import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';

import { NotificationService } from './notification.service';
import { NotificationTemplateQueryParamsDto } from './dtos/template-query.dto';
import { NotificationTemplateResponseDto } from './dtos/template-response.dto';
import { UpdateNotificationTemplateDto } from './dtos/template.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('templates')
  async getAllTemplates(
    @Query() query: NotificationTemplateQueryParamsDto,
  ): Promise<NotificationTemplateResponseDto[]> {
    return await this.notificationService.getAllTemplates(query);
  }

  @Get('template/:templateId')
  async getTemplateById(
    @Param('templateId', ParseUUIDPipe) templateId: string,
  ): Promise<NotificationTemplateResponseDto> {
    return await this.notificationService.getTemplateById(templateId);
  }

  @Patch('template/:templateId')
  async updateTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() updateTemplateDto: UpdateNotificationTemplateDto,
  ): Promise<NotificationTemplateResponseDto> {
    return await this.notificationService.updateTemplate(
      templateId,
      updateTemplateDto,
    );
  }
}
