import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsUUID()
  @IsOptional()
  tenantId?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @MaxLength(50)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  @MinLength(11)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string | null;
}

export class UpdateUserDto extends PartialType(UserDto) {}
