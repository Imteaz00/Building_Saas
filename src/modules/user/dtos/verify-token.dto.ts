import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyTokenDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
