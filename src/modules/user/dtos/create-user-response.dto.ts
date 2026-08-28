import { User } from '../entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserResponseDto {
  @ApiProperty({ description: 'The created user' })
  newUser: User;

  @ApiProperty({ description: 'The verification token' })
  token: string;
}
