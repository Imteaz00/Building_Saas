import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class NotificationTemplateQueryParamsDto {
  @ApiPropertyOptional({
    description: 'The channel of the notification template',
    enum: ['email', 'sms', 'in-app'],
    required: false,
  })
  @IsOptional()
  @IsIn(['email', 'sms', 'in-app'])
  channel?: 'email' | 'sms' | 'in-app';

  @ApiPropertyOptional({
    description: 'The event key of the notification template',
    required: false,
  })
  @IsOptional()
  @IsString()
  eventKey?: string;
}
