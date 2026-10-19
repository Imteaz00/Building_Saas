import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
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

@Exclude()
export class NotificationTemplateResponseDto {
  @Expose()
  @ApiProperty({ description: "The template's ID" })
  id: string;

  @Expose()
  @ApiProperty({ description: "The template's event key" })
  eventKey: string;

  @Expose()
  @ApiProperty({ description: "The template's channel" })
  channel: 'email' | 'sms' | 'in-app';

  @Expose()
  @ApiProperty({ description: "The template's subject" })
  @IsOptional()
  subject?: string | null;

  @Expose()
  @ApiProperty({ description: "The template's content" })
  body: string;
}
