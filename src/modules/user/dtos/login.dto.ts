import { IsDate, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class LoginResponseDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @IsNotEmpty()
  @IsDate()
  accessTokenExpiresAt: Date;

  @IsString()
  @IsNotEmpty()
  refreshToken: string;

  @IsNotEmpty()
  @IsDate()
  refreshTokenExpiresAt: Date;
}
