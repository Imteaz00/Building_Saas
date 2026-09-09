import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';

import { LoginDto, LoginResponseDto } from '../dtos/login.dto';
import { UserService } from '../user.service';
import { BcryptProvider } from '../providers/bcrypt.provider';
import authConfig from '../config/auth.config';
import { UserSession } from '../entities/session.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly bcryptProvider: BcryptProvider,
    private readonly jwtService: JwtService,

    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,

    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async login(LoginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userService.getUserByUserName(LoginDto.username);
    if (!user) {
      throw new UnauthorizedException('Wrong Credentials');
    }

    //if user has no password hash, it means the user has not set a password yet, so we should not allow login
    if (!user.passwordHash) {
      throw new UnauthorizedException('User is not active');
    }

    if (user.state !== 'active') {
      throw new UnauthorizedException('User is not active');
    }

    const isPasswordValid = await this.bcryptProvider.compareData(
      LoginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Wrong Credentials');
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, companyId: user.company.id },
      {
        secret: this.config.secret,
        expiresIn: this.config.expiresIn,
      },
    );

    const refreshTokenData = await this.createSession(user.id);

    return {
      accessToken,
      accessTokenExpiresAt: new Date(Date.now() + this.config.expiresIn * 1000),
      refreshToken: refreshTokenData.token,
      refreshTokenExpiresAt: refreshTokenData.expires_at,
    };
  }

  async createSession(
    userId: string,
  ): Promise<{ token: string; expires_at: Date }> {
    const issuedAt = new Date();
    const lastSeenAt = new Date();

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.config.expiresIn);

    const refreshToken = randomBytes(32).toString('hex');

    try {
      let session = this.sessionRepository.create({
        user: { id: userId },
        issuedAt,
        lastSeenAt,
        expiresAt,
        refreshToken,
      });

      session = await this.sessionRepository.save(session);
      if (!session) {
        throw new Error('Failed to create session');
      }
      return { token: session.refreshToken, expires_at: session.expiresAt };
    } catch (error) {
      throw error;
    }
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; accessTokenExpiresAt: Date }> {
    const session = await this.sessionRepository.findOne({
      where: {
        refreshToken,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: { user: { company: true } },
    });
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: session.user.id, companyId: session.user.company.id },
      {
        secret: this.config.secret,
        expiresIn: this.config.expiresIn,
      },
    );

    session.lastSeenAt = new Date();
    await this.sessionRepository.save(session);

    return {
      accessToken,
      accessTokenExpiresAt: new Date(Date.now() + this.config.expiresIn * 1000),
    };
  }
}
