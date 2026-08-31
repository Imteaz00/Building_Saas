import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { CompanyService } from './company.service';
import { CompanyDto } from './dtos/company.dto';
import { CompanyResponseDto } from './dtos/company-response.dto';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  async createCompany(
    @Body() companyDto: CompanyDto,
  ): Promise<CompanyResponseDto> {
    return this.companyService.createCompany(companyDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by ID' })
  async getCompanyById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CompanyResponseDto> {
    return await this.companyService.getCompanyById(id);
  }

  @Get('/get-all-ids')
  @ApiOperation({
    summary: 'Get IDs of all companies with legal names and trading names',
  })
  async getCompaniesIds(): Promise<
    { id: string; legalName: string; tradingName: string }[]
  > {
    return await this.companyService.getCompanyIds();
  }
}
