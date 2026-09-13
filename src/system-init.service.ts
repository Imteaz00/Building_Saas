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
    console.log('Check before seeding initial data...');
    let rootCompany: Company;

    await this.dataSource.transaction(async (manager) => {
      try {
        const upsertResult = await manager.upsert(
          Company,
          {
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
          },
          ['slug'],
        );
        rootCompany = await manager.findOneByOrFail(Company, {
          slug: 'default-company',
        });
        console.log('Upserted company:', rootCompany);
      } catch (error) {
        console.warn(
          'Company already seeding or initialized by a concurrent replica.',
          error,
        );
        return;
      }
      try {
        const passwordHash = await this.bcryptProvider.hashData('12345678');
        const superAdminUser = manager.upsert(
          'User',
          {
            name: 'Super Admin',
            username: 'super-admin',
            email: 'superadmin@example.com',
            passwordHash,
            role: 'superadmin',
            state: 'active',
            company: { id: rootCompany.id },
            passwordUpdatedAt: new Date(),
          },
          ['email', 'company', 'username'],
        );
        console.log('Seeded successfully');
      } catch (error) {
        console.warn(
          'Super Admin user already seeding or initialized by a concurrent replica.',
          error,
        );
        return;
      }
    });
  }
}
