import { PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class NotificationTemplateDto {
  @IsString()
  eventKey: string;

  @IsIn(['email', 'sms', 'in-app'])
  channel: 'email' | 'sms' | 'in-app';

  @IsString()
  @IsOptional()
  subject: string;

  @IsString()
  body: string;
}

export class UpdateNotificationTemplateDto extends PartialType(
  NotificationTemplateDto,
) {}
