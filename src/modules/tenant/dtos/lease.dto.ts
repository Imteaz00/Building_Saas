import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class LeaseDto {
  @IsUUID()
  @IsNotEmpty()
  unitId: string;

  @IsUUID()
  @IsNotEmpty()
  tenantId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: Date;

  @IsDateString()
  @IsNotEmpty()
  endDate: Date;

  @IsNotEmpty()
  @IsIn(['monthly', 'quarterly', 'yearly'])
  billingCycle: 'monthly' | 'quarterly' | 'yearly';

  @IsNotEmpty()
  @IsInt()
  billingDay: number;

  @IsNotEmpty()
  @IsNumber()
  depositAmount: number;

  @IsNotEmpty()
  @IsInt()
  noticePeriodDays: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  renewalTerms: string;
}

export class UpdateLeaseDto extends PartialType(
  OmitType(LeaseDto, ['unitId', 'tenantId'] as const),
) {}

@Exclude()
export class LeaseResponseDto {
  @Expose()
  @ApiProperty({ description: 'The unique identifier of the lease' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'The start date of the lease' })
  startDate: Date;

  @Expose()
  @ApiProperty({ description: 'The end date of the lease' })
  endDate: Date;

  @Expose()
  @ApiProperty({ description: 'The billing cycle of the lease' })
  billingCycle: 'monthly' | 'quarterly' | 'yearly';

  @Expose()
  @ApiProperty({ description: 'The billing day of the lease' })
  billingDay: number;

  @Expose()
  @ApiProperty({ description: 'The deposit amount of the lease' })
  depositAmount: number;

  @Expose()
  @ApiProperty({ description: 'The notice period in days of the lease' })
  noticePeriodDays: number;

  @Expose()
  @ApiProperty({ description: 'The renewal terms of the lease' })
  renewalTerms: string;

  @Expose()
  @ApiProperty({ description: 'The status of the lease' })
  status:
    'active' | 'draft' | 'expiring' | 'expired' | 'terminated' | 'renewed';

  @Expose()
  @ApiProperty({
    description: 'The date and time when the lease was activated',
  })
  activatedAt: Date | null;

  @Expose()
  @ApiProperty({
    description: 'The date and time when the lease was terminated',
  })
  terminatedAt: Date | null;

  @Expose()
  @ApiProperty({ description: 'The reason for the lease termination' })
  terminationReason: string | null;
}
