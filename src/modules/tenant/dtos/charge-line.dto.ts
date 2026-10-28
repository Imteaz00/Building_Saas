import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class LeaseChargeLineDto {
  @IsUUID()
  @IsNotEmpty()
  leaseId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  label: string;

  @IsNotEmpty()
  @IsIn(['rent', 'service', 'utility', 'parking', 'other'])
  type: 'rent' | 'service' | 'utility' | 'parking' | 'other';

  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @IsNotEmpty()
  @IsBoolean()
  billsEveryCycle: boolean;

  @IsNotEmpty()
  @IsBoolean()
  prorates: boolean;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  effectiveFrom: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  effectiveTo: Date | null;
}

export class UpdateLeaseChargeLineDto extends PartialType(
  OmitType(LeaseChargeLineDto, ['leaseId'] as const),
) {}

export class LeaseChargeLineResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the lease charge line',
  })
  id: string;

  @ApiProperty({ description: 'The unique identifier of the lease' })
  label: string;

  @ApiProperty({ description: 'The type of the lease charge line' })
  type: 'rent' | 'service' | 'utility' | 'parking' | 'other';

  @ApiProperty({ description: 'The amount of the lease charge line' })
  amount: number;

  @ApiProperty({ description: 'Whether the charge line bills every cycle' })
  billsEveryCycle: boolean;

  @ApiProperty({ description: 'Whether the charge line prorates' })
  prorates: boolean;

  @ApiProperty({
    description: 'The effective from date of the lease charge line',
  })
  effectiveFrom: Date;

  @ApiProperty({
    description: 'The effective to date of the lease charge line',
  })
  effectiveTo: Date | null;
}
