import { Company } from 'src/modules/company/company.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class LateFeeRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @Column({ type: 'boolean', nullable: false })
  enabled: boolean;

  @Column({ type: 'enum', enum: ['percentage', 'fixed'], nullable: false })
  basis: 'percentage' | 'fixed';

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  value: number;

  @Column({ name: 'grace_period_days', type: 'int', nullable: false })
  gracePeriodDays: number;

  @Column({ name: 'repeats_per_period', type: 'boolean', nullable: false })
  repeatsPerPeriod: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
