import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserSession } from './entities/session.entity';
import { Verification } from './entities/verification.entity';
import { BcryptProvider } from './providers/bcrypt.provider';
import { CompanyModule } from '../company/company.module';
import userConfig from './config/user.config';
import { AuthService } from './services/auth.service';
import authConfig from './config/auth.config';

@Module({
  controllers: [UserController],
  providers: [UserService, BcryptProvider, AuthService],
  imports: [
    TypeOrmModule.forFeature([User, Verification, UserSession]),
    CompanyModule,
    ConfigModule.forFeature(userConfig),
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync(authConfig.asProvider()),
  ],
})
export class UserModule {}
