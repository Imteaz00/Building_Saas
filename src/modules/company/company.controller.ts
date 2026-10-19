import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { CompanyService } from './company.service';
import { CompanyDto, CompanyResponseDto } from './company.dto';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post('create')
  @ApiBearerAuth('Authorization')
  @ApiOperation({ summary: 'Create a new company' })
  async createCompany(
    @Body() companyDto: CompanyDto,
  ): Promise<CompanyResponseDto> {
    return this.companyService.createCompany(companyDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all companies',
  })
  async getCompaniesIds(): Promise<CompanyResponseDto[]> {
    return await this.companyService.getCompanyIds();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by ID' })
  async getCompanyById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CompanyResponseDto> {
    return await this.companyService.getCompanyById(id);
  }

  @Get('/validate-slug/:slug')
  @ApiOperation({ summary: 'Validate if a company slug exists' })
  async validateCompanySlug(
    @Param('slug') slug: string,
  ): Promise<{ exists: boolean }> {
    const exists = await this.companyService.validateSlug(slug);
    return { exists };
  }
}
