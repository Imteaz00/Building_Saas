import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class AnnouncementDto {
  @IsUUID()
  @IsNotEmpty()
  buildingId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsNotEmpty()
  @IsIn(['building', 'units'])
  audienceType: 'building' | 'units';

  @IsNotEmpty()
  @IsDateString()
  publishAt: Date;

  @IsUUID('4', { each: true })
  @IsOptional()
  units?: string[];
}

export class UpdateAnnouncementDto extends PartialType(
  OmitType(AnnouncementDto, ['buildingId'] as const),
) {}

@Exclude()
export class AnnouncementResponseDto {
  @Expose()
  @ApiProperty({ description: 'The unique identifier of the announcement' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'The title of the announcement' })
  title: string;

  @Expose()
  @ApiProperty({ description: 'The body of the announcement' })
  body: string;

  @Expose()
  @ApiProperty({
    description:
      'Whether the announcement is for the whole building or some units',
  })
  audienceType: 'building' | 'units';

  @Expose()
  @ApiProperty({
    description:
      'The date and time when the announcement is scheduled to be published',
  })
  publishAt: Date;

  @Expose()
  @ApiProperty({
    description:
      'The date and time when the announcement was actually published, if applicable',
    required: false,
  })
  publishedAt?: Date | null;

  @Expose()
  @ApiProperty({
    description:
      'The date and time when the announcement was withdrawn, if applicable',
    required: false,
  })
  withdrawnAt?: Date | null;

  @Expose()
  @ApiProperty({
    description:
      'The unique identifier of the user who created the announcement',
  })
  @Transform(({ obj }) => obj.createdBy.id)
  createdById: string;

  @Expose()
  @ApiProperty({
    description:
      'The unique identifier of the user who withdrew the announcement, if applicable',
    required: false,
  })
  @Transform(({ obj }) => obj.withdrawnBy?.id)
  withdrawnBy?: string | null;

  @Expose()
  @ApiProperty({
    description: 'The date and time when the announcement was created',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'List of units associated with the announcement',
    required: false,
  })
  @Transform(({ obj }) => obj.units?.map((unit) => unit.id))
  units: string[];
}
