import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class DefaultChargeDto {
  @IsUUID()
  @IsNotEmpty()
  unitId: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsNotEmpty()
  chargeKind: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsBoolean()
  @IsNotEmpty()
  billsEveryCycle: boolean;
}

export class UpdateDefaultChargeDto extends PartialType(
  OmitType(DefaultChargeDto, ['unitId'] as const),
) {}

@Exclude()
export class DefaultChargeResponseDto {
  @Expose()
  @ApiProperty({ description: 'The unique identifier of the default charge' })
  id: string;

  @Expose()
  @ApiProperty({
    description:
      'The unique identifier of the unit associated with the default charge',
  })
  @Transform(({ obj }) => obj.unit.id)
  unitId: string;

  @Expose()
  @ApiProperty({ description: 'The label of the default charge' })
  label: string;

  @Expose()
  @ApiProperty({
    description: 'The kind of charge (e.g., rent, maintenance, etc.)',
  })
  chargeKind: string;

  @Expose()
  @ApiProperty({ description: 'The amount of the default charge' })
  amount: number;

  @Expose()
  @ApiProperty({
    description: 'Indicates whether the charge is billed every cycle',
  })
  billsEveryCycle: boolean;
}
