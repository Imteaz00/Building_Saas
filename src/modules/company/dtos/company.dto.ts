import { PartialType } from '@nestjs/mapped-types';
import {
  IsEmail,
  IsISO4217CurrencyCode,
  IsLocale,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsTimeZone,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CompanyDto {
  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  tradingName: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  legalName: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  slug: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  address: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  taxRegistrationId: string;

  @IsUUID()
  @IsOptional()
  logoId?: string;

  @IsISO4217CurrencyCode()
  @IsNotEmpty()
  baseCurrency: string;

  @IsLocale()
  @IsNotEmpty()
  defaultLocale: string;

  @IsTimeZone()
  @IsNotEmpty()
  timeZone: string;
}

export class UpdateCompanyDto extends PartialType(CompanyDto) {}
