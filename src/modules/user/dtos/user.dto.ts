import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
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

@Exclude()
export class UserResponseDto {
  @Expose()
  @ApiProperty({ description: 'The created user' })
  id: string;

  @Expose()
  @ApiProperty({ description: "The user's email" })
  email: string;

  @Expose()
  @ApiProperty({ description: "The user's phone number" })
  phone?: string | null;

  @Expose()
  @ApiProperty({ description: 'The user username' })
  username: string;
}
