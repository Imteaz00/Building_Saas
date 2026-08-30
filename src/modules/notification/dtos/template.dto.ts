import { IsString } from 'class-validator';

export class NotificationTemplateDto {
  @IsString()
  eventKey: string;

  @IsString()
  channel: 'email' | 'sms' | 'in-app';

  @IsString()
  @IsString()
  subject: string;

  @IsString()
  body: string;
}
