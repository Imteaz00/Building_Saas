import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Company } from 'src/modules/company/company.entity';
import { Lease } from 'src/modules/tenant/entities/lease.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class MissedBillingException {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @ManyToOne(() => Lease, { nullable: false })
  lease: Lease;

  @Column({ type: 'date', nullable: false })
  periodStart: Date;

  @Column({ type: 'date', nullable: false })
  periodEnd: Date;

  @Column({ type: 'date', nullable: false })
  expectedIssueDate: Date;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  reason: string;

  @CreateDateColumn({ name: 'detected_at' })
  detectedAt: Date;

  @Column({ name: 'resolved_at', type: 'date', nullable: true })
  resolvedAt: Date | null;

  @ManyToOne(() => User, { nullable: true })
  resolvedBy: User | null;
}
