import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permission } from './entities/permission.entity';
import { UserPermission } from './entities/user-permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,

    @InjectRepository(UserPermission)
    private readonly userPermissionRepository: Repository<UserPermission>,
  ) {}

  async checkPermission(
    userId: string,
    permissionCode: string,
    companyId: string,
  ): Promise<boolean> {
    const userPermission = await this.userPermissionRepository.findOne({
      where: {
        user: { id: userId },
        permission: { code: permissionCode },
        company: { id: companyId },
      },
    });
    return !!userPermission;
  }

  async getUserPermissions(
    userId: string,
    companyId: string,
  ): Promise<Permission[]> {
    const userPermissions = await this.userPermissionRepository.find({
      where: {
        user: { id: userId },
        company: { id: companyId },
      },
      relations: { permission: true },
    });
    return userPermissions.map((userPermission) => userPermission.permission);
  }

  async addPermissionToUser(
    userId: string,
    permissionCode: string,
    companyId: string,
    grantedById: string,
  ): Promise<void> {
    try {
      const permission = await this.permissionRepository.findOne({
        where: { code: permissionCode },
      });
      if (!permission) {
        throw new NotFoundException(
          `Permission with code ${permissionCode} not found`,
        );
      }
      await this.userPermissionRepository.save({
        user: { id: userId },
        permission: { id: permission.id },
        company: { id: companyId },
        grantedBy: { id: grantedById },
      });
    } catch (error) {
      throw error;
    }
  }

  async revokePermissionFromUser(
    userId: string,
    permissionCode: string,
    companyId: string,
    revokedById: string,
  ): Promise<void> {
    try {
      await this.userPermissionRepository.update(
        {
          user: { id: userId },
          permission: { code: permissionCode },
          company: { id: companyId },
        },
        {
          revokedBy: { id: revokedById },
        },
      );
      await this.userPermissionRepository.delete({
        user: { id: userId },
        permission: { code: permissionCode },
        company: { id: companyId },
        revokedBy: { id: revokedById },
      });
    } catch (error) {
      throw error;
    }
  }
}
