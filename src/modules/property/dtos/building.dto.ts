import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class BuildingDto {
  @IsNotEmpty()
  @IsUUID()
  companyId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  address: string;

  @IsOptional()
  @IsString()
  buildingType?: string;

  @IsNotEmpty()
  @IsInt()
  yearBuilt: number;

  @IsOptional()
  @IsInt()
  floorCount?: number;

  @IsOptional()
  @IsString()
  ownershipNotes?: string;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}

export class UpdateBuildingDto extends PartialType(BuildingDto) {}

export class BuildingResponseDto {
  @ApiProperty({ description: 'The unique identifier of the building' })
  id: string;

  @ApiProperty({ description: 'The unique identifier of the company' })
  companyId: string;

  @ApiProperty({ description: 'The name of the building' })
  name: string;

  @ApiProperty({ description: 'The address of the building' })
  address: string;

  @ApiProperty({ description: 'The type of the building', required: false })
  buildingType?: string;

  @ApiProperty({ description: 'The year the building was built' })
  yearBuilt: number;

  @ApiProperty({
    description: 'The number of floors in the building',
    required: false,
  })
  floorCount?: number;

  @ApiProperty({
    description: 'Notes about the ownership of the building',
    required: false,
  })
  ownershipNotes?: string;

  @ApiProperty({
    description: 'The status of the building',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';
}
