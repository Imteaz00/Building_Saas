import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Company } from './modules/company/company.entity';
import { BcryptProvider } from './providers/bcrypt.provider';
import { User } from './modules/user/entities/user.entity';
import { DEFAULT_NOTIFICATION_TEMPLATES } from './constants/default-notification-templates';

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
    let superAdminUser: User;

    await this.dataSource.transaction(async (manager) => {
      try {
        await manager.upsert(
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
          'Company already seeded or initialized by a concurrent replica.',
        );
        return;
      }
      try {
        const passwordHash = await this.bcryptProvider.hashData('12345678');
        await manager.upsert(
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
        superAdminUser = await manager.findOneByOrFail(User, {
          username: 'super-admin',
        });
        console.log('User Seeded successfully');
      } catch (error) {
        console.warn(
          'Super Admin user already seeded or initialized by a concurrent replica.',
        );
        return;
      }
      try {
        for (const template of DEFAULT_NOTIFICATION_TEMPLATES) {
          await manager.upsert(
            'notification_template',
            {
              ...template,
              company: { id: rootCompany.id },
            },
            ['eventKey', 'channel', 'company'],
          );
        }
      } catch (error) {
        throw new Error(
          'Failed to seed notification templates. Please check the error: ' +
            error,
        );
      }
    });
  }
}
