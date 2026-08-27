import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { BcryptProvider } from './provider/bcrypt.provider';
import { CompanyService } from '../company/company.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly bcryptProvider: BcryptProvider,
    private readonly companyService: CompanyService,
  ) {}

  async createUser(userDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: userDto.email },
    });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await this.bcryptProvider.hashPassword(
      userDto.password,
    );

    const company = await this.companyService.getCompanyById(userDto.companyId);

    let newUser = this.userRepository.create({
      ...userDto,
      passwordHash,
      company,
    });
    newUser = await this.userRepository.save(newUser);
    return newUser;
  }
}
