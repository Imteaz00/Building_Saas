import { PartialType, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class BuildingDto {
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

@Exclude()
export class BuildingResponseDto {
  @Expose()
  @ApiProperty({ description: 'The unique identifier of the building' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'The unique identifier of the company' })
  @Transform(({ obj }) => obj.company.id)
  companyId: string;

  @Expose()
  @ApiProperty({ description: 'The name of the building' })
  name: string;

  @Expose()
  @ApiProperty({ description: 'The address of the building' })
  address: string;

  @Expose()
  @ApiProperty({ description: 'The type of the building', required: false })
  buildingType?: string;

  @Expose()
  @ApiProperty({ description: 'The year the building was built' })
  yearBuilt: number;

  @Expose()
  @ApiProperty({
    description: 'The number of floors in the building',
    required: false,
  })
  floorCount?: number;

  @Expose()
  @ApiProperty({
    description: 'Notes about the ownership of the building',
    required: false,
  })
  ownershipNotes?: string;

  @Expose()
  @ApiProperty({
    description: 'The status of the building',
    enum: ['active', 'inactive'],
    default: 'active',
  })
  status: 'active' | 'inactive';
}

export class BuildingQueryDto extends PartialType(BuildingDto) {
  @IsOptional()
  @IsInt()
  limit?: number;

  @IsOptional()
  @IsInt()
  offset?: number;
}
