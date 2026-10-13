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

  @Patch('template/update')
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
}
