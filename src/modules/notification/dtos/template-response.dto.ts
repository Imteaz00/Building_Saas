import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class NotificationTemplateResponseDto {
  @ApiProperty({ description: "The template's ID" })
  id: string;

  @ApiProperty({ description: "The template's event key" })
  eventKey: string;

  @ApiProperty({ description: "The template's channel" })
  channel: 'email' | 'sms' | 'in-app';

  @ApiProperty({ description: "The template's subject" })
  @IsOptional()
  subject?: string | null;

  @ApiProperty({ description: "The template's content" })
  body: string;
}
