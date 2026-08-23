import { Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';

import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dtos/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(user: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: user.email },
    });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    let newUser = this.userRepository.create(user);
    newUser = await this.userRepository.save(newUser);
    return newUser;
  }
}
