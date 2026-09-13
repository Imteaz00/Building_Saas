import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, createHash } from 'crypto';
import type { Request } from 'express';

import { LoginDto, LoginResponseDto } from '../dtos/login.dto';
import { UserService } from '../user.service';
import { BcryptProvider } from '../../../providers/bcrypt.provider';
import { UserSession } from '../entities/session.entity';
import { UAParserProvider } from '../../../providers/uaparser.provider';
import { ActiveUserType } from 'src/interfaces/active-user.interface';
import { JwtProvider } from 'src/providers/jwt.provider';
import userConfig from '../config/user.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly bcryptProvider: BcryptProvider,
    private readonly jwtProvider: JwtProvider,
    private readonly uaParserProvider: UAParserProvider,

    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,

    @Inject(userConfig.KEY)
    private readonly config: ConfigType<typeof userConfig>,
  ) {}

  async login(LoginDto: LoginDto, req: Request): Promise<LoginResponseDto> {
    const user = await this.userService.getUserByUserName({
      username: LoginDto.username,
      company: true,
    });
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

    const { accessToken, accessTokenExpiresAt } =
      await this.jwtProvider.createAccessToken({
        sub: user.id,
        companyId: user.company.id,
        role: user.role,
      });

    const userAgent = this.uaParserProvider.parseUserAgent(
      req.headers['user-agent'] || '',
    );

    const sourceIp = req.headers['x-forwarded-for']
      ? (req.headers['x-forwarded-for'] as string).split(',')[0].trim()
      : req.socket.remoteAddress || null;

    const refreshTokenData = await this.createSession(
      user.id,
      userAgent,
      sourceIp,
    );

    return {
      accessToken,
      accessTokenExpiresAt,
      refreshToken: refreshTokenData.token,
      refreshTokenExpiresAt: refreshTokenData.expires_at,
    };
  }

  async createSession(
    userId: string,
    userAgent: string,
    sourceIp: string | null,
  ): Promise<{ token: string; expires_at: Date }> {
    const issuedAt = new Date();
    const lastSeenAt = new Date();

    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + this.config.refreshTokenExpiry,
    );

    const refreshToken = randomBytes(32).toString('hex');
    const refreshTokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    try {
      let session = this.sessionRepository.create({
        user: { id: userId },
        issuedAt,
        lastSeenAt,
        expiresAt,
        refreshTokenHash,
        sourceIp,
        userAgent,
      });

      session = await this.sessionRepository.save(session);
      if (!session) {
        throw new Error('Failed to create session');
      }
      return { token: refreshToken, expires_at: session.expiresAt };
    } catch (error) {
      throw error;
    }
  }

  async refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; accessTokenExpiresAt: Date }> {
    const refreshTokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');
    const session = await this.sessionRepository.findOne({
      where: {
        refreshTokenHash,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: { user: { company: true } },
    });
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.user.state !== 'active') {
      throw new UnauthorizedException('User is not active');
    }

    const { accessToken, accessTokenExpiresAt } =
      await this.jwtProvider.createAccessToken({
        sub: session.user.id,
        companyId: session.user.company.id,
        role: session.user.role,
      });
    session.lastSeenAt = new Date();
    await this.sessionRepository.save(session);

    return {
      accessToken,
      accessTokenExpiresAt,
    };
  }
}
