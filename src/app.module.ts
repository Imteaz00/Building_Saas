import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompanyModule } from './modules/company/company.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { NotificationModule } from './modules/notification/notification.module';
import { DocumentModule } from './modules/document/document.module';
import { PropertyModule } from './modules/property/property.module';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import appConfig from './config/app.config';
import databaseConfig from './config/databse.config';
import envValidator from './config/env.validatior';
import { AuthorizeGuard } from './guards/authorize.guard';
import authConfig from './modules/user/config/auth.config';
import emailConfig from './config/email.config';

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig, emailConfig],
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
      }),
    }),

    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync(authConfig.asProvider()),
    CompanyModule,
    UserModule,
    RoleModule,
    AuditLogModule,
    NotificationModule,
    DocumentModule,
    PropertyModule,
    AnnouncementModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    //  { provide: 'APP_GUARD', useClass: AuthorizeGuard }
  ],
})
export class AppModule {}
