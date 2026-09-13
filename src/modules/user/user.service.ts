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
import { BcryptProvider } from '../../providers/bcrypt.provider';
import { CompanyService } from '../company/company.service';
import { Verification } from './entities/verification.entity';
import userConfig from './config/user.config';
import { VerifyTokenDto } from 'src/modules/user/dtos/verify-token.dto';
import { UserResponseDto } from 'src/modules/user/dtos/user-response.dto';
import { ActiveUserType } from 'src/interfaces/active-user.interface';
import { JwtProvider } from 'src/providers/jwt.provider';
import { UserSession } from './entities/session.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Verification)
    private verificationRepository: Repository<Verification>,
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,

    @InjectDataSource() private dataSource: DataSource,

    @Inject(userConfig.KEY)
    private readonly config: ConfigType<typeof userConfig>,

    private readonly bcryptProvider: BcryptProvider,
    private readonly companyService: CompanyService,
    private readonly mailerService: MailerService,
    private readonly jwtProvider: JwtProvider,
  ) {}

  async createUser(
    userDto: UserDto,
    companyId: string,
  ): Promise<UserResponseDto> {
    try {
      const company = await this.companyService.getCompanyById(companyId);
      const usernameWithCompany = `${userDto.username}@${company.slug}`;
      const where: any = [
        { username: usernameWithCompany, company: { id: companyId } },
        { email: userDto.email, company: { id: companyId } },
      ];
      if (userDto.phone) {
        where.push({
          phone: userDto.phone,
          company: { id: companyId },
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

      const passwordHash = userDto.password
        ? await this.bcryptProvider.hashData(userDto.password)
        : null;

      const { newUser, token } = await this.dataSource.transaction(
        async (manager) => {
          let newUser = manager.create(User, {
            ...userDto,
            passwordHash,
            username: usernameWithCompany,
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
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        username: newUser.username,
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

    const token = randomBytes(this.config.verificationTokenLength).toString(
      'hex',
    );
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

  async verifyToken(
    verifyTokenDto: VerifyTokenDto,
  ): Promise<{ accessToken: string; accessTokenExpiresAt: Date }> {
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
        throw new BadRequestException('Invalid verification token');
      }

      const result = await this.dataSource.transaction(async (manager) => {
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

        await manager.update(User, { id: userId }, { state: 'active' });
        return result;
      });

      if (result.affected === 0) {
        throw new Error('Could not verify token');
      }

      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: { company: true },
      });
      const { accessToken, accessTokenExpiresAt } =
        await this.jwtProvider.createAccessToken({
          sub: userId,
          companyId: user?.company.id,
          role: user?.role,
        });

      return { accessToken, accessTokenExpiresAt };
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

  async validateUsername(
    username: string,
    activeUser: ActiveUserType,
  ): Promise<string | false> {
    const companyId = activeUser.companyId;
    try {
      const company = await this.companyService.getCompanyById(companyId);
      if (!company) {
        throw new NotFoundException('Company not found');
      }

      const newUsername = `${username}@${company.slug}`;
      const user = await this.userRepository.findOne({
        where: { username: newUsername },
      });
      if (user) {
        return false;
      }
      return newUsername;
    } catch (error) {
      throw error;
    }
  }

  async updateUser(
    user: UpdateUserDto,
    activeUser: ActiveUserType,
  ): Promise<UserResponseDto> {
    try {
      const userId = activeUser.sub;
      const existingUser = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }

      if (user.username && user.username !== existingUser.username) {
        const newUsername = await this.validateUsername(
          user.username,
          activeUser,
        );
        if (!newUsername) {
          throw new ConflictException('Username already exists');
        }
        existingUser.username = newUsername;
      }

      if (user.password) {
        existingUser.passwordHash = await this.bcryptProvider.hashData(
          user.password,
        );
        existingUser.passwordUpdatedAt = new Date();
        //revoke all existing sessions for the user
        const now = new Date();
        await this.sessionRepository.update(
          {
            user: { id: userId },
            revokedAt: IsNull(),
            expiresAt: MoreThan(now),
          },
          { revokedAt: now },
        );
      }
      // Update other fields if provided
      if (user.email) {
        existingUser.email = user.email;
      }
      if (user.phone) {
        existingUser.phone = user.phone;
      }

      const updatedUser = await this.userRepository.save(existingUser);

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

  async getUserByUserName({
    username,
    company = false,
  }: {
    username: string;
    company?: boolean;
  }): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { username },
        relations: company ? { company: true } : {},
      });
      return user || null;
    } catch (error) {
      throw error;
    }
  }
}
