import { ApiProperty, PartialType } from '@nestjs/swagger';
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

export class UpdateDefaultChargeDto extends PartialType(DefaultChargeDto) {}

export class DefaultChargeResponseDto {
  @ApiProperty({ description: 'The unique identifier of the default charge' })
  id: string;

  @ApiProperty({
    description:
      'The unique identifier of the unit associated with the default charge',
  })
  unitId: string;

  @ApiProperty({ description: 'The label of the default charge' })
  label: string;

  @ApiProperty({
    description: 'The kind of charge (e.g., rent, maintenance, etc.)',
  })
  chargeKind: string;

  @ApiProperty({ description: 'The amount of the default charge' })
  amount: number;

  @ApiProperty({
    description: 'Indicates whether the charge is billed every cycle',
  })
  billsEveryCycle: boolean;

  constructor(partial: Partial<DefaultChargeResponseDto>) {
    Object.assign(this, partial);
  }
}
