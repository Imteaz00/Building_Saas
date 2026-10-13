import { Company } from 'src/modules/company/company.entity';
import { Lease } from 'src/modules/tenant/entities/lease.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Index(['lease', 'periodStart'], {
  unique: true,
  where: '"deleted_at" IS NULL',
})
export class BillingCycle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @ManyToOne(() => Lease, { nullable: false })
  lease: Lease;

  // @OneToOne(() => Invoice, { nullable: true })
  // invoice?: Invoice | null;

  @Column({ type: 'date', nullable: false })
  periodStart: Date;

  @Column({ type: 'date', nullable: false })
  periodEnd: Date;

  @Column({ type: 'date', nullable: true })
  issueDate?: Date | null;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
