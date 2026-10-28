import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class RoleResponseDto {
  @Expose()
  @ApiProperty({ description: 'The unique identifier of the role' })
  id: string;

  @Expose()
  @ApiProperty({ description: 'The name of the role' })
  name: string;

  @Expose()
  @ApiProperty({
    description:
      'The unique identifier of the company associated with the role',
  })
  @Transform(({ obj }) => obj.building?.id)
  buildingId?: string | null;
}
