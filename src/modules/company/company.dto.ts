import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
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
  @MaxLength(20)
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

@Exclude()
export class CompanyResponseDto {
  @Expose()
  @ApiProperty({ description: 'The created company ID' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'The legal name of the company' })
  legalName: string;

  @Expose()
  @ApiProperty({ description: 'The trading name of the company' })
  tradingName: string;

  @Expose()
  @ApiProperty({ description: 'The email of the company' })
  email: string;

  @Expose()
  @ApiProperty({ description: 'The phone number of the company' })
  phone: string;

  @Expose()
  @ApiProperty({ description: 'The logo of the company', required: false })
  logo?: string | null;

  @Expose()
  @ApiProperty({ description: 'The slug of the company' })
  slug: string;
}
