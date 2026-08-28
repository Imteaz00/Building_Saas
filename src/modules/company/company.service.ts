import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from './company.entity';
import { CreateCompanyDto } from './dtos/create-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
  ) {}

  async createCompany(companyDto: CreateCompanyDto): Promise<Company> {
    try {
      const existingCompany = await this.companyRepository.findOne({
        where: [{ email: companyDto.email }, { phone: companyDto.phone }],
      });
      if (existingCompany) {
        throw new ConflictException(
          'Company with this email or phone already exists',
        );
      }

      //handle logo

      let newCompany = this.companyRepository.create(companyDto);
      newCompany = await this.companyRepository.save(newCompany);
      if (!newCompany) {
        throw new Error('Failed to create company');
      }
      return newCompany;
    } catch (error) {
      throw error;
    }
  }

  async getCompanyById(id: string): Promise<Company> {
    try {
      const company = await this.companyRepository.findOne({ where: { id } });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
      return company;
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
}
