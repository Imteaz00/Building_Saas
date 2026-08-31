import { ApiProperty } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty({ description: 'The created company ID' })
  id: string;
  @ApiProperty({ description: 'The legal name of the company' })
  legalName: string;
  @ApiProperty({ description: 'The trading name of the company' })
  tradingName: string;
  @ApiProperty({ description: 'The email of the company' })
  email: string;
  @ApiProperty({ description: 'The phone number of the company' })
  phone: string;
  @ApiProperty({ description: 'The logo of the company', required: false })
  logo?: string | null;
}
