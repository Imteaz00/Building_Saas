import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { ActiveUserType } from 'src/interfaces/active-user.interface';
import authConfig from 'src/config/auth.config';

@Injectable()
export class JwtProvider {
  constructor(
    private readonly jwtService: JwtService,

    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async createAccessToken(
    activeUser: Partial<ActiveUserType>,
  ): Promise<{ accessToken: string; accessTokenExpiresAt: Date }> {
    const accessToken = await this.jwtService.signAsync(activeUser, {
      secret: this.config.secret,
      expiresIn: this.config.expiresIn,
    });
    return {
      accessToken,
      accessTokenExpiresAt: new Date(Date.now() + this.config.expiresIn * 1000),
    };
  }
}
