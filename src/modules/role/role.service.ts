import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private roleRepository: Repository<Role>,
  ) {}

  async createRole(
    userId: string,
    companyId: string,
    buildingId: string | null,
    role: string,
  ): Promise<Role> {
    return this.roleRepository.save({
      user: { id: userId },
      company: { id: companyId },
      building: buildingId ? { id: buildingId } : null,
      name: role,
    });
  }

  async getUserRoles(userId: string, companyId: string): Promise<Role[]> {
    return this.roleRepository.find({
      where: {
        user: { id: userId },
        company: { id: companyId },
      },
      relations: { building: true },
    });
  }
}
