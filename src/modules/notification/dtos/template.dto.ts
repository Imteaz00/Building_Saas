import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class NotificationTemplateDto {
  @IsString()
  eventKey: string;

  @IsIn(['email', 'sms', 'push'])
  channel: 'email' | 'sms' | 'push';

  @IsString()
  @IsOptional()
  subject: string;

  @IsString()
  body: string;
}

export class UpdateNotificationTemplateDto extends PartialType(
  NotificationTemplateDto,
) {}
