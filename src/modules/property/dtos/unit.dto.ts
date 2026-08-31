import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UnitDto {
  @IsNotEmpty()
  @IsUUID()
  buildingId: string;

  @IsNotEmpty()
  @IsString()
  unitNumber: string;

  @IsNotEmpty()
  @IsString()
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

  @IsOptional()
  @IsInt()
  bathroomCount?: number;

  @IsOptional()
  @IsIn(['occupied', 'vacant', 'reserved', 'unavailable'])
  occupancyStatus: 'occupied' | 'vacant' | 'reserved' | 'unavailable';

  @IsOptional()
  @IsString()
  unavailableReason?: string;

  @IsOptional()
  @IsDate()
  expectedReturnDate?: Date;
}

export class UpdateUnitDto extends PartialType(UnitDto) {}

export class UnitResponseDto {
  @ApiProperty({ description: 'The unique identifier of the unit' })
  id: string;

  @ApiProperty({ description: 'The unique identifier of the building' })
  buildingId: string;

  @ApiProperty({ description: 'The unit number' })
  unitNumber: string;

  @ApiProperty({ description: 'The type of the unit' })
  unitType: 'apartment' | 'commercial' | 'parking' | 'common_area';

  @ApiProperty({ description: 'The floor number of the unit' })
  floor: number;

  @ApiProperty({ description: 'The size of the unit' })
  size: number;

  @ApiProperty({ description: 'The unit of measurement for the size' })
  sizeUnit: 'sqft' | 'sqm';

  @ApiProperty({
    description: 'The number of bedrooms in the unit',
    required: false,
  })
  bedroomCount?: number;

  @ApiProperty({
    description: 'The number of bathrooms in the unit',
    required: false,
  })
  bathroomCount?: number;

  @ApiProperty({
    description: 'The occupancy status of the unit',
    required: false,
  })
  occupancyStatus?: 'occupied' | 'vacant' | 'reserved' | 'unavailable';

  @ApiProperty({
    description: 'The reason for the unit being unavailable',
    required: false,
  })
  unavailableReason?: string;

  @ApiProperty({
    description: 'The expected return date of the unit',
    required: false,
  })
  expectedReturnDate?: Date;
}
