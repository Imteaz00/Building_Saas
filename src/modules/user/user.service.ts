import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import type { ConfigType } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

import {
  Repository,
  DataSource,
  EntityManager,
  MoreThan,
  IsNull,
} from 'typeorm';
import { randomBytes } from 'crypto';

import { User } from './entities/user.entity';
import { UpdateUserDto, UserDto } from './dtos/user.dto';
import { BcryptProvider } from './providers/bcrypt.provider';
import { CompanyService } from '../company/company.service';
import { Verification } from './entities/verification.entity';
import userConfig from './config/user.config';
import { VerifyTokenDto } from 'src/modules/user/dtos/verify-token.dto';
import { UserResponseDto } from 'src/modules/user/dtos/user-response.dto';

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
    private readonly mailerService: MailerService,
  ) {}

  async createUser(
    userDto: UserDto,
  ): Promise<{ user: UserResponseDto; token: string }> {
    try {
      const where: any = [
        { username: userDto.username },
        { email: userDto.email, company: { id: userDto.companyId } },
      ];
      if (userDto.phone) {
        where.push({
          phone: userDto.phone,
          company: { id: userDto.companyId },
        });
      }
      const existingUser = await this.userRepository.findOne({
        where: where,
      });
      if (existingUser) {
        throw new ConflictException(
          'User with this email or username already exists',
        );
      }

      const company = await this.companyService.getCompanyById(
        userDto.companyId,
      );

      const userCompanySlug = userDto.username.split('@')[1];

      if (!userCompanySlug || userCompanySlug !== company.slug) {
        throw new BadRequestException('Invalid username');
      }

      const passwordHash = userDto.password
        ? await this.bcryptProvider.hashData(userDto.password)
        : 'notset';

      const { newUser, token } = await this.dataSource.transaction(
        async (manager) => {
          let newUser = manager.create(User, {
            ...userDto,
            passwordHash,
            company: { id: company.id },
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

      await this.mailerService.sendMail({
        to: newUser.email,
        subject: 'Verify your email',
        html: `This is your token: ${token}`,
      });

      return {
        user: {
          id: newUser.id,
          email: newUser.email,
          phone: newUser.phone,
          username: newUser.username,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  private async createVerificationToken(
    userId: string,
    purpose: 'activation' | 'reset',
    manager?: EntityManager,
  ): Promise<{ verification: Verification; token: string }> {
    const repo = manager
      ? manager.getRepository(Verification)
      : this.verificationRepository;

    const token = randomBytes(32).toString('hex');
    try {
      const verification = repo.create({
        user: { id: userId },
        purpose,
        token,
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

      if (verification.token !== token) {
        return false;
      }

      const { result, user } = await this.dataSource.transaction(
        async (manager) => {
          const result = await manager.update(
            Verification,
            {
              id: verification.id,
              usedAt: IsNull(),
              expiresAt: MoreThan(new Date()),
            },
            {
              usedAt: new Date(),
            },
          );

          const user = await manager.update(
            User,
            {
              where: { id: userId },
            },
            { state: 'active' },
          );

          return { result, user };
        },
      );

      return result.affected === 1;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        username: user.username,
      };
    } catch (error) {
      throw error;
    }
  }

  async validateUsername(username: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({
        where: { username },
      });
      return !!user;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(user: UpdateUserDto): Promise<UserResponseDto> {
    try {
      if (!user.userId) {
        throw new BadRequestException('User ID is required');
      }
      const existingUser = await this.userRepository.findOne({
        where: { id: user.userId },
      });
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      if (user.password) {
        user.password = await this.bcryptProvider.hashData(user.password);
      }

      const updatedUser = await this.userRepository.save(user);
      if (!updatedUser) {
        throw new Error('Failed to update user');
      }
      return {
        id: updatedUser.id,
        email: updatedUser.email,
        phone: updatedUser.phone,
        username: updatedUser.username,
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserByUserName(username: string): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { username },
      });
      return user || null;
    } catch (error) {
      throw error;
    }
  }
}
