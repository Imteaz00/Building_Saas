import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dtos/create-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  async createCompany(@Body() companyDto: CreateCompanyDto) {
    return this.companyService.createCompany(companyDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by ID' })
  async getCompanyById(@Param('id') id: string) {
    return await this.companyService.getCompanyById(id);
  }

  @Get('/get-all-ids')
  @ApiOperation({
    summary: 'Get IDs of all companies with legal names and trading names',
  })
  async getCompaniesIds() {
    return await this.companyService.getCompanyIds();
  }
}
