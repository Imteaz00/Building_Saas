import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

import { Company } from './company.entity';
import { CompanyDto, CompanyResponseDto } from './company.dto';
import { convertToResponseDto } from 'src/utils/responseDto';
import { NOTIFICATION_EVENTS } from 'src/constants/contants';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,

    @InjectQueue('notification-queue')
    private readonly notificationQueue: Queue,
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
      await this.notificationQueue.add(NOTIFICATION_EVENTS.SETUP_TEMPLATES, {
        companyId: newCompany.id,
      });
      return convertToResponseDto(CompanyResponseDto, newCompany);
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
      return convertToResponseDto(CompanyResponseDto, company);
    } catch (error) {
      throw error;
    }
  }

  async getCompanyIds(): Promise<CompanyResponseDto[]> {
    try {
      const companies = await this.companyRepository.find({
        select: { id: true, legalName: true, tradingName: true },
      });
      return companies.map((company) =>
        convertToResponseDto(CompanyResponseDto, company),
      );
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
