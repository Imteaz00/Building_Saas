import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Company } from './modules/company/company.entity';
import { BcryptProvider } from './providers/bcrypt.provider';

@Injectable()
export class SystemInitService implements OnModuleInit {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly bcryptProvider: BcryptProvider,
  ) {}

  async onModuleInit() {
    // Check if the database connection is established
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
    await this.seedInitialDataIfNeeded();
  }

  private async seedInitialDataIfNeeded() {
    const companyCount = await this.dataSource.getRepository('Company').count();
    if (companyCount > 0) return; // Data already exists, no need to seed

    console.log('Seeding initial data...');

    const passwordHash = await this.bcryptProvider.hashData('12345678');

    await this.dataSource.transaction(async (manager) => {
      // Create a default company
      const defaultCompany: Company = manager.create('Company', {
        legalName: 'Default Company',
        slug: 'default-company',
        tradingName: 'Default Company',
        address: 'default address',
        email: 'info@default.com',
        phone: '1234567890',
        taxRegistrationId: '123456789',
        baseCurrency: 'USD',
        defaultLocale: 'en-US',
        timeZone: 'America/New_York',
      });
      const company = await manager.save(defaultCompany);

      const superAdminUser = manager.create('User', {
        name: 'Super Admin',
        username: 'superadmin',
        email: 'superadmin@example.com',
        passwordHash,
        role: 'superadmin',
        state: 'active',
        company: { id: company.id },
        passwordUpdatedAt: new Date(),
      });
      await manager.save(superAdminUser);
    });
  }
}
