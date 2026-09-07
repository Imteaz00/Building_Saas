import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

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

const ENV = process.env.NODE_ENV;
@Module({
  imports: [
    CompanyModule,
    UserModule,

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
      load: [appConfig, databaseConfig],
      validationSchema: envValidator,
    }),

    ConfigModule.forFeature(authConfig),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('database.url'),
        autoLoadEntities: true,
        synchronize: configService.get('database.synchronize'),
      }),
    }),

    JwtModule.registerAsync(authConfig.asProvider()),
    RoleModule,
    AuditLogModule,
    NotificationModule,
    DocumentModule,
    PropertyModule,
    AnnouncementModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: 'APP_GUARD', useClass: AuthorizeGuard }],
})
export class AppModule {}
