import { Injectable } from '@nestjs/common';
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
    const existingCompany = await this.companyRepository.findOne({
      where: [{ email: companyDto.email }, { phone: companyDto.phone }],
    });

    if (existingCompany) {
      throw new Error('Company with this email or phone already exists');
    }

    //handle logo

    const newCompany = this.companyRepository.create(companyDto);
    return this.companyRepository.save(newCompany);
  }

  async getCompanyById(id: string): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { id } });
    if (!company) {
      throw new Error('Company not found');
    }
    return company;
  }
}
