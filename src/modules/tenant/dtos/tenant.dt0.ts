import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class TenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  fullname: string;

  @IsIn(['individual', 'company'])
  @IsNotEmpty()
  type: 'individual' | 'company';

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(50)
  primaryEmail: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  alternativePhone: string;

  @IsIn(['passport', 'national_id', 'drivers_license'])
  @IsNotEmpty()
  idType: 'passport' | 'national_id' | 'drivers_license';

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  idNumber: string;

  @IsString()
  @MaxLength(50)
  @IsNotEmpty()
  nationality: string;

  //reg_number

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  emergencyContactName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  emergencyContactPhone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  correspondenceAddress: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  noEmailReason: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  notes: string;
}

export class UpdateTenantDto extends PartialType(TenantDto) {}

@Exclude()
export class TenantResponseDto {
  @Expose()
  @ApiProperty({ description: 'The unique identifier of the tenant' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'The full name of the tenant' })
  fullname: string;

  @Expose()
  @ApiProperty({ description: 'The type of the tenant' })
  type: 'individual' | 'company';

  @Expose()
  @ApiProperty({ description: 'The primary email of the tenant' })
  primaryEmail: string;

  @Expose()
  @ApiProperty({ description: 'The phone number of the tenant' })
  phone: string;

  @Expose()
  @ApiProperty({ description: 'The alternative phone number of the tenant' })
  alternativePhone: string;

  @Expose()
  @ApiProperty({ description: 'The type of identification of the tenant' })
  idType: 'passport' | 'national_id' | 'drivers_license';

  @Expose()
  @ApiProperty({ description: 'The identification number of the tenant' })
  idNumber: string;

  @Expose()
  @ApiProperty({ description: 'The nationality of the tenant' })
  nationality: string;

  @Expose()
  @ApiProperty({
    description: 'The name of the emergency contact of the tenant',
  })
  emergencyContactName: string;

  @Expose()
  @ApiProperty({
    description: 'The phone number of the emergency contact of the tenant',
  })
  emergencyContactPhone: string;

  @Expose()
  @ApiProperty({ description: 'The correspondence address of the tenant' })
  correspondenceAddress: string;

  @Expose()
  @ApiProperty({
    description: 'The reason for not having an email for the tenant',
  })
  noEmailReason: string;

  @Expose()
  @ApiProperty({ description: 'Additional notes about the tenant' })
  notes: string;
}
