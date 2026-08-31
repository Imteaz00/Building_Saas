import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ description: 'The created user' })
  id: string;

  @ApiProperty({ description: "The user's email" })
  email: string;

  @ApiProperty({ description: "The user's phone number" })
  phone?: string | null;

  @ApiProperty({ description: 'The verification token' })
  token: string;
}
