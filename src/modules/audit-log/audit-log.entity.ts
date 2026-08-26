import {
  BeforeRemove,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Company } from '../company/company.entity';
import { User } from '../user/user.entity';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @ManyToOne(() => User, { nullable: false })
  actingUser: User;

  @Column({
    name: 'acting_role',
    type: 'varchar',
    nullable: false,
    length: 10,
  })
  actingRole: string;

  @Column({ type: 'varchar', nullable: false, length: 20 })
  action: string;

  @Column({ name: 'target_type', type: 'varchar', nullable: false, length: 50 })
  targetType: string;

  @Column({ name: 'target_id', type: 'varchar', nullable: false, length: 50 })
  targetId: string;

  @Column({ name: 'before_values', type: 'json', nullable: true })
  beforeValues: string;

  @Column({ name: 'after_values', type: 'json', nullable: true })
  afterValues: string;

  @CreateDateColumn({ name: 'occurred_at' })
  occurredAt: Date;

  @Column({ name: 'source_ip', type: 'varchar', nullable: true, length: 45 })
  sourceIp: string;

  @BeforeUpdate()
  throwOnUpdate() {
    throw new Error('AuditLog entity is immutable and cannot be updated.');
  }

  @BeforeRemove()
  throwOnDelete() {
    throw new Error('AuditLog entity is immutable and cannot be deleted.');
  }
}
