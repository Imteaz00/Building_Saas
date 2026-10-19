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
import {
  UpdateNotificationTemplateDto,
  NotificationTemplateResponseDto,
} from './dtos/template.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ActiveUser } from 'src/decorators/active-user.decorator';
import type { ActiveUserType } from 'src/interfaces/active-user.interface';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('templates')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Get all/filtered notification templates' })
  async getAllTemplates(
    @Query() query: NotificationTemplateQueryParamsDto,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<NotificationTemplateResponseDto[]> {
    return await this.notificationService.getAllTemplates(query, activeUser);
  }

  @Get('template/:templateId')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Get a notification template by ID' })
  async getTemplateById(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<NotificationTemplateResponseDto> {
    return await this.notificationService.getTemplateById(
      templateId,
      activeUser,
    );
  }

  @Patch('template/update/:templateId')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Update a notification template by ID' })
  async updateTemplate(
    @Param('templateId', ParseUUIDPipe) templateId: string,
    @Body() updateTemplateDto: UpdateNotificationTemplateDto,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<NotificationTemplateResponseDto> {
    return await this.notificationService.updateTemplate(
      templateId,
      updateTemplateDto,
      activeUser,
    );
  }

  @Get('retry-delivery/:deliveryId')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Retry a notification delivery by ID' })
  async retryDelivery(
    @Param('deliveryId', ParseUUIDPipe) deliveryId: string,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<void> {
    return await this.notificationService.retryDelivery(deliveryId, activeUser);
  }

  @Get('retry-event/:eventId')
  @ApiBearerAuth('Authorization')
  @ApiOperation({
    summary: 'Retry all notification deliveries for an event by ID',
  })
  async retryEventDeliveries(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @ActiveUser() activeUser: ActiveUserType,
  ): Promise<void> {
    return await this.notificationService.retryEventDeliveries(
      eventId,
      activeUser,
    );
  }
}
