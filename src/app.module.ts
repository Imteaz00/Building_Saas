import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './modules/company/company.module';
import { UserModule } from './modules/user/user.module';
import { PermissionModule } from './modules/permission/permission.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DocumentModule } from './modules/document/document.module';
import { PropertyModule } from './modules/property/property.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import appConfig from './config/app.config';
import databaseConfig from './config/databse.config';
import envValidator from './config/env.validatior';
import { AuthorizeGuard } from './guards/authorize.guard';
import authConfig from './config/auth.config';
import emailConfig from './config/email.config';
import { SystemInitService } from './system-init.service';
import { BcryptProvider } from './providers/bcrypt.provider';
import { TenantModule } from './modules/tenant/tenant.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { BullModule } from '@nestjs/bullmq';
import { RoleModule } from './modules/role/role.module';

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig, emailConfig, authConfig],
      validationSchema: envValidator,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('database.url'),
        autoLoadEntities: true,
        synchronize: configService.get('database.synchronize'),
      }),
    }),

    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get('email.host'),
          port: configService.get('email.port'),
          secure: configService.get('email.secure'),
          auth: {
            user: configService.get('email.auth.user'),
            pass: configService.get('email.auth.pass'),
          },
        },
        defaults: {
          from: '"no-reply" <no-reply@example.com>',
        },
      }),
    }),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get('redis.host') || 'localhost',
          port: parseInt(configService.get('redis.port') || '6379'),
        },
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: 1000,
          removeOnFail: 1000,
        },
      }),
    }),

    JwtModule.registerAsync({ global: true, ...authConfig.asProvider() }),
    CompanyModule,
    UserModule,
    RoleModule,
    PermissionModule,
    AuditLogModule,
    NotificationModule,
    DocumentModule,
    PropertyModule,
    AnnouncementModule,
    TenantModule,
    InvoiceModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: 'APP_GUARD', useClass: AuthorizeGuard },
    SystemInitService,
    BcryptProvider,
  ],
})
export class AppModule {}
