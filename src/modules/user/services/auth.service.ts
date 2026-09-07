import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { LoginDto } from '../dtos/login.dto';
import { UserService } from '../user.service';
import { BcryptProvider } from '../providers/bcrypt.provider';
import userConfig from '../config/user.config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly bcryptProvider: BcryptProvider,
    // private readonly jwtService: JwtService,

    @Inject(userConfig.KEY)
    private readonly config: ConfigType<typeof userConfig>,
  ) {}

  //   async login(
  //     LoginDto: LoginDto,
  //   ): Promise<{ accessToken: string; expiresIn: number }> {
  //     const user = await this.userService.getUserByEmail(LoginDto.email);
  //     if (!user) {
  //       throw new UnauthorizedException('Wrong Credentials');
  //     }

  //     if (user.state !== 'active') {
  //       throw new UnauthorizedException('User is not active');
  //     }

  //     if (!user.passwordHash) {
  //       throw new UnauthorizedException('User is not active');
  //     }

  //     const isPasswordValid = await this.bcryptProvider.compareData(
  //       LoginDto.password,
  //       user.passwordHash,
  //     );

  //     if (!isPasswordValid) {
  //       throw new UnauthorizedException('Wrong Credentials');
  //     }

  //     const accessToken = await this.jwtService.signAsync(
  //       { id: user.id, companyId: user.company.id },
  //       {
  //         secret: this.config.jwtSecret,
  //         expiresIn: this.config.accessTokenExpiry,
  //       },
  //     );

  //     return { accessToken, expiresIn: this.config.accessTokenExpiry };
  //   }
}
