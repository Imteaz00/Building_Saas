import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { Company } from '../../company/company.entity';
import { UserSession } from './session.entity';

@Entity()
@Index(['email', 'company'], { unique: true, where: 'deleted_at IS NULL' })
@Index(['company', 'phone'], { unique: true, where: 'deleted_at IS NULL' })
@Index(['company', 'username'], { unique: true, where: 'deleted_at IS NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, (company) => company.users, { nullable: false })
  company: Company;
  //   tenant_id

  @Column({ type: 'varchar', nullable: false, length: 50 })
  name: string;

  @Column({ type: 'varchar', nullable: false, length: 50 })
  username: string;

  @Column({ type: 'varchar', nullable: false, length: 50 })
  email: string;

  @Column({ type: 'varchar', nullable: true, length: 15 })
  phone: string | null;

  @Column({
    type: 'enum',
    enum: [
      'superadmin',
      'admin',
      'building_manager',
      'accountant',
      'maintenance_manager',
      'tenant',
      'technician',
      'vendor',
    ],
    nullable: true,
  })
  role:
    | 'superadmin'
    | 'admin'
    | 'building_manager'
    | 'accountant'
    | 'maintenance_manager'
    | 'tenant'
    | 'technician'
    | 'vendor'
    | null;

  @Column({
    type: 'enum',
    enum: ['pending-activation', 'active', 'suspended', 'deactivated'],
    nullable: false,
    default: 'pending-activation',
  })
  state: 'pending-activation' | 'active' | 'suspended' | 'deactivated';

  @Column({
    name: 'password_hash',
    type: 'varchar',
    nullable: true,
    length: 60,
  })
  @Exclude()
  passwordHash: string | null;

  @Column({
    name: 'password_updated_at',
    type: 'timestamp',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  passwordUpdatedAt: Date | null;

  @Column({
    name: 'failed_attempt_count',
    type: 'int',
    nullable: false,
    default: 0,
  })
  failedAttemptCount: number;

  @Column({ name: 'locked_until', type: 'timestamp', nullable: true })
  lockedUntil: Date | null;

  @Column({
    name: 'last_sign_in_at',
    type: 'timestamp',
    nullable: true,
  })
  lastSignInAt: Date | null;

  @Column({ name: 'deactivated_at', type: 'timestamp', nullable: true })
  deactivatedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  //   @BeforeInsert()
  //   @BeforeUpdate()
  //   validateTenantId() {
  //     if (this.role === 'tenant' && !this.tenantId) {
  //       throw new Error('Tenant users must have a tenantId');
  //     }
}
