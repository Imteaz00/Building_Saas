import { Company } from 'src/modules/company/company.entity';
import { Building } from 'src/modules/property/entities/building.entity';
import { Unit } from 'src/modules/property/entities/unit.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tenant } from './tenant.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class Lease {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @ManyToOne(() => Building, { nullable: false })
  building: Building;

  @ManyToOne(() => Unit, { nullable: false })
  unit: Unit;

  @ManyToOne(() => Tenant, { nullable: false })
  tenant: Tenant;

  @OneToOne(() => Lease, { nullable: true })
  @JoinColumn({ name: 'previous_lease_id' })
  previousLease?: Lease | null;

  @Column({ name: 'start_date', type: 'date', nullable: false })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: false })
  endDate: Date;

  @Column({
    name: 'billing_cycle',
    type: 'enum',
    enum: ['monthly', 'quarterly', 'yearly'],
    nullable: false,
  })
  billingCycle: 'monthly' | 'quarterly' | 'yearly';

  @Column({ name: 'billing_day', type: 'int', nullable: false })
  billingDay: number;

  @Column({
    name: 'deposit_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  depositAmount: number;

  @Column({ name: 'notice_period_days', type: 'int', nullable: false })
  noticePeriodDays: number;

  @Column({
    name: 'renewal_terms',
    type: 'varchar',
    nullable: false,
    length: 255,
  })
  renewalTerms: string;

  @Column({
    type: 'enum',
    enum: ['active', 'draft', 'expiring', 'expired', 'terminated', 'renewed'],
    nullable: false,
  })
  status:
    'active' | 'draft' | 'expiring' | 'expired' | 'terminated' | 'renewed';

  //   activatedAt: Date | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'activated_by' })
  activatedBy: User;

  @Column({ name: 'terminated_at', type: 'timestamp', nullable: true })
  terminatedAt: Date | null;

  @Column({ name: 'termination_reason', type: 'varchar', nullable: true })
  terminationReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
