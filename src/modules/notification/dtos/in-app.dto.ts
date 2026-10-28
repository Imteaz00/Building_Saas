import { ApiProperty } from '@nestjs/swagger';

export class InAppNotificationResponseDto {
  @ApiProperty({ description: 'The ID of the in-app notification' })
  id: string;

  @ApiProperty({ description: 'The title of the in-app notification' })
  title: string;

  @ApiProperty({ description: 'The body of the in-app notification' })
  message: string;

  //link type and link id, need to know

  @ApiProperty({
    description:
      'The timestamp when the notification was read, or null if unread',
  })
  readAt: Date | null;
}
