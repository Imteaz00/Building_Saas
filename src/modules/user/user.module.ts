import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserSession } from './entities/session.entity';
import { Verification } from './entities/verification.entity';
import { BcryptProvider } from './provider/bcrypt.provider';
import { CompanyModule } from '../company/company.module';
import userConfig from './config/user.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [UserController],
  providers: [UserService, BcryptProvider],
  imports: [
    TypeOrmModule.forFeature([User, Verification, UserSession]),
    CompanyModule,
    ConfigModule.forFeature(userConfig),
  ],
})
export class UserModule {}
