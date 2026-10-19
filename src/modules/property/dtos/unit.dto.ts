import { ApiProperty, PartialType, OmitType } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class UnitDto {
  @IsNotEmpty()
  @IsUUID()
  buildingId: string;

  @IsNotEmpty()
  @IsString()
  unitNumber: string;

  @IsNotEmpty()
  @IsIn(['apartment', 'commercial', 'parking', 'common_area'])
  unitType: 'apartment' | 'commercial' | 'parking' | 'common_area';

  @IsNotEmpty()
  @IsInt()
  floor: number;

  @IsNotEmpty()
  @IsInt()
  size: number;

  @IsNotEmpty()
  @IsIn(['sqft', 'sqm'])
  sizeUnit: 'sqft' | 'sqm';

  @IsOptional()
  @IsInt()
  bedroomCount?: number;

  @IsNotEmpty()
  @IsInt()
  bathroomCount?: number;

  @IsOptional()
  @IsIn(['occupied', 'vacant', 'reserved', 'unavailable'])
  occupancyStatus: 'occupied' | 'vacant' | 'reserved' | 'unavailable';

  @IsOptional()
  @IsString()
  unavailableReason?: string;

  @IsOptional()
  @IsDateString()
  expectedReturnDate?: Date;
}

export class UpdateUnitDto extends PartialType(
  OmitType(UnitDto, ['buildingId'] as const),
) {}

@Exclude()
export class UnitResponseDto {
  @Expose()
  @ApiProperty({ description: 'The unique identifier of the unit' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'The unit number' })
  unitNumber: string;

  @Expose()
  @ApiProperty({ description: 'The type of the unit' })
  unitType: 'apartment' | 'commercial' | 'parking' | 'common_area';

  @Expose()
  @ApiProperty({ description: 'The floor number of the unit' })
  floor: number;

  @Expose()
  @ApiProperty({ description: 'The size of the unit' })
  size: number;

  @Expose()
  @ApiProperty({ description: 'The unit of measurement for the size' })
  sizeUnit: 'sqft' | 'sqm';

  @Expose()
  @ApiProperty({
    description: 'The number of bedrooms in the unit',
    required: false,
  })
  bedroomCount?: number;

  @Expose()
  @ApiProperty({
    description: 'The number of bathrooms in the unit',
    required: false,
  })
  bathroomCount?: number;

  @Expose()
  @ApiProperty({
    description: 'The occupancy status of the unit',
    required: false,
  })
  occupancyStatus?: 'occupied' | 'vacant' | 'reserved' | 'unavailable';

  @Expose()
  @ApiProperty({
    description: 'The reason for the unit being unavailable',
    required: false,
  })
  unavailableReason?: string;

  @Expose()
  @ApiProperty({
    description: 'The expected return date of the unit',
    required: false,
  })
  expectedReturnDate?: Date;
}

export class UnitQueryDto extends PartialType(
  OmitType(UnitDto, ['buildingId']),
) {
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  limit?: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;
}
