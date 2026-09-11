import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserSession } from './entities/session.entity';
import { Verification } from './entities/verification.entity';
import { BcryptProvider } from '../../providers/bcrypt.provider';
import { CompanyModule } from '../company/company.module';
import userConfig from './config/user.config';
import { AuthService } from './services/auth.service';
import { UAParserProvider } from '../../providers/uaparser.provider';
import { JwtProvider } from 'src/providers/jwt.provider';

@Module({
  controllers: [UserController],
  providers: [
    UserService,
    BcryptProvider,
    AuthService,
    UAParserProvider,
    JwtProvider,
  ],
  imports: [
    TypeOrmModule.forFeature([User, Verification, UserSession]),
    CompanyModule,
    ConfigModule.forFeature(userConfig),
    MailerModule,
  ],
})
export class UserModule {}
