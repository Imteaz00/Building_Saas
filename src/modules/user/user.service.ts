import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import type { ConfigType } from '@nestjs/config';

import { Repository, DataSource, EntityManager } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { BcryptProvider } from './provider/bcrypt.provider';
import { CompanyService } from '../company/company.service';
import { Verification } from './entities/verification.entity';
import userConfig from './config/user.config';
import { VerifyTokenDto } from 'src/modules/user/dtos/verify-token.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Verification)
    private verificationRepository: Repository<Verification>,

    @InjectDataSource() private dataSource: DataSource,

    @Inject(userConfig.KEY)
    private readonly config: ConfigType<typeof userConfig>,

    private readonly bcryptProvider: BcryptProvider,
    private readonly companyService: CompanyService,
  ) {}

  async createUser(
    userDto: CreateUserDto,
  ): Promise<{ newUser: User; token: string }> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: userDto.email },
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const company = await this.companyService.getCompanyById(
        userDto.companyId,
      );
      if (!company) {
        throw new NotFoundException('Company not found');
      }

      const { newUser, token } = await this.dataSource.transaction(
        async (manager) => {
          let newUser = manager.create(User, {
            ...userDto,
            company,
            state: 'pending-activation',
          });
          newUser = await manager.save(newUser);

          if (!newUser) {
            throw new Error('Failed to create user');
          }
          const { verification, token } = await this.createVerificationToken(
            newUser.id,
            'activation',
            manager,
          );
          return { newUser, token };
        },
      );
      return { newUser, token };
    } catch (error) {
      throw error;
    }
  }

  async createVerificationToken(
    userId: string,
    purpose: 'activation' | 'reset',
    manager?: EntityManager,
  ): Promise<{ verification: Verification; token: string }> {
    const repo = manager
      ? manager.getRepository(Verification)
      : this.verificationRepository;

    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const tokenHash = await this.bcryptProvider.hashData(token);
      const verification = repo.create({
        user: { id: userId },
        purpose,
        tokenHash,
        expiresAt: new Date(
          Date.now() + this.config.verificationTokenExpiry * 60 * 1000,
        ),
      });
      const savedVerification = await repo.save(verification);
      if (!savedVerification) {
        throw new Error('Failed to create verification token');
      }
      return { verification: savedVerification, token };
    } catch (error) {
      throw error;
    }
  }

  async verifyToken(verifyTokenDto: VerifyTokenDto): Promise<boolean> {
    const { token, userId } = verifyTokenDto;
    try {
      const verification = await this.verificationRepository.findOne({
        where: { user: { id: userId } },
        order: { createdAt: 'DESC' },
      });
      if (!verification) {
        throw new NotFoundException('Verification token not found');
      }

      if (verification.expiresAt < new Date()) {
        throw new BadRequestException('Verification token has expired');
      }
      if (verification.usedAt) {
        throw new BadRequestException('Verification token has expired');
      }

      const isMatch = await this.bcryptProvider.compareData(
        token,
        verification.tokenHash,
      );
      if (!isMatch) {
        throw new BadRequestException('Invalid verification token');
      }
      verification.usedAt = new Date();
      await this.verificationRepository.save(verification);
      return true;
    } catch (error) {
      throw error;
    }
  }

  //   async updatePassword(userId: string, password: string) {
  //     try {
  //       const user = await this.userRepository.findOne({ where: { id: userId } });
  //       if (!user) {
  //         throw new NotFoundException('User not found');
  //       }

  //       const verification = await this.verificationRepository.findOne({
  //         where: { user: { id: userId } },
  //         order: { createdAt: 'DESC' },
  //       });

  //       const hashedPassword = await this.bcryptProvider.hashData(password);
  //       user.password = hashedPassword;
  //       return await this.userRepository.save(user);
  //     } catch (error) {
  //       throw error;
  //     }
  //   }
}
