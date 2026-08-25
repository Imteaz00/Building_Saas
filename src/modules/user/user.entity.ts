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
import { Company } from '../company/company.entity';

@Entity()
@Index(['email', 'company'], { unique: true, where: 'deleted_at IS NULL' })
@Index(['company', 'phone'], { unique: true, where: 'deleted_at IS NULL' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  //   company_id
  @ManyToOne(() => Company, (company) => company.users, { nullable: false })
  company: Company;
  //   tenant_id

  @Column({ type: 'varchar', nullable: false, length: 100 })
  name: string;

  @Column({ type: 'varchar', nullable: false, length: 50 })
  email: string;

  @Column({ type: 'varchar', nullable: true, length: 15 })
  phone: string;

  //   role_enum

  @Column({
    type: 'enum',
    enum: ['pending activation', 'active', 'suspended', 'deactivated'],
    nullable: false,
    default: 'pending activation',
  })
  state: 'pending activation' | 'active' | 'suspended' | 'deactivated';

  @Column({ type: 'varchar', nullable: false })
  password_hash: string;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  password_updated_at: Date;

  @Column({ type: 'int', nullable: false, default: 0 })
  failed_attempt_count: number;

  @Column({ type: 'timestamp', nullable: true })
  locked_until: Date | null;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  last_sign_in_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deactivated_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
