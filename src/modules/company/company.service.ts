import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from './company.entity';
import { CompanyDto } from './dtos/company.dto';
import { CompanyResponseDto } from './dtos/company-response.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
  ) {}

  async createCompany(companyDto: CompanyDto): Promise<CompanyResponseDto> {
    try {
      const existingCompany = await this.companyRepository.findOne({
        where: [
          { email: companyDto.email },
          { phone: companyDto.phone },
          { slug: companyDto.slug },
        ],
      });
      if (existingCompany) {
        throw new ConflictException(
          'Company with this email, phone, or slug already exists',
        );
      }

      //handle logo

      let newCompany = this.companyRepository.create(companyDto);
      newCompany = await this.companyRepository.save(newCompany);
      if (!newCompany) {
        throw new Error('Failed to create company');
      }
      return {
        id: newCompany.id,
        legalName: newCompany.legalName,
        tradingName: newCompany.tradingName,
        email: newCompany.email,
        phone: newCompany.phone,
        slug: newCompany.slug,
        // logo: newCompany?.logo,
      };
    } catch (error) {
      throw error;
    }
  }

  async getCompanyById(id: string): Promise<CompanyResponseDto> {
    try {
      const company = await this.companyRepository.findOne({ where: { id } });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      return {
        id: company.id,
        legalName: company.legalName,
        tradingName: company.tradingName,
        email: company.email,
        phone: company.phone,
        slug: company.slug,
        // logo: company?.logo,
      };
    } catch (error) {
      throw error;
    }
  }

  async getCompanyIds(): Promise<
    { id: string; legalName: string; tradingName: string }[]
  > {
    try {
      const companies = await this.companyRepository.find({
        select: { id: true, legalName: true, tradingName: true },
      });
      return companies.map((company) => ({
        id: company.id,
        legalName: company.legalName,
        tradingName: company.tradingName,
      }));
    } catch (error) {
      throw error;
    }
  }

  async validateSlug(slug: string): Promise<boolean> {
    try {
      const existingCompany = await this.companyRepository.findOne({
        where: { slug },
      });
      return !!existingCompany;
    } catch (error) {
      throw error;
    }
  }
}
