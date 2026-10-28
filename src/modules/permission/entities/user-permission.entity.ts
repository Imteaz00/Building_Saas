import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from 'src/modules/user/entities/user.entity';
import { Permission } from './permission.entity';
import { Company } from 'src/modules/company/company.entity';
import { Delete } from '@nestjs/common';

@Entity()
export class UserPermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @ManyToOne(() => Permission, { nullable: false })
  permission: Permission;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @ManyToOne(() => User, { nullable: false })
  grantedBy: User;

  @ManyToOne(() => User, { nullable: true })
  revokedBy?: User | null;

  @CreateDateColumn({ name: 'granted_at' })
  grantedAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'revoked_at', nullable: true })
  revokedAt?: Date | null;
}
