import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Company } from 'src/modules/company/company.entity';
import { Building } from 'src/modules/property/entities/building.entity';
import { Unit } from 'src/modules/property/entities/unit.entity';
import { Lease } from 'src/modules/tenant/entities/lease.entity';
import { Tenant } from 'src/modules/tenant/entities/tenant.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @ManyToOne(() => Lease, { nullable: false })
  lease: Lease;

  @ManyToOne(() => Tenant, { nullable: false })
  payer: Tenant;

  @ManyToOne(() => Building, { nullable: false })
  building: Building;

  @ManyToOne(() => Unit, { nullable: false })
  unit: Unit;

  @Column({ name: 'payer_name', type: 'varchar', nullable: false, length: 50 })
  payerName: string;

  @Column({ name: 'billing_period_start', type: 'date', nullable: false })
  billingPeriodStart: Date;

  @Column({ name: 'billing_period_end', type: 'date', nullable: false })
  billingPeriodEnd: Date;

  @Column({ name: 'issue_date', type: 'date', nullable: false })
  issueDate: Date;

  @Column({ name: 'due_date', type: 'date', nullable: false })
  dueDate: Date;

  @Column({
    name: 'subtotal',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  subtotal: number;

  @Column({
    name: 'discount_total',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  discountTotal: number;

  @Column({
    name: 'tax_total',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  taxTotal: number;

  @Column({
    name: 'total_due',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  totalDue: number;

  @Column({
    type: 'enum',
    enum: ['draft', 'issued', 'paid', 'overdue', 'partially_paid', 'void'],
    nullable: false,
  })
  state: 'draft' | 'issued' | 'paid' | 'overdue' | 'partially_paid' | 'void';

  @Column({ name: 'is_manual', type: 'boolean', nullable: false })
  isManual: boolean;

  @Column({ name: 'void_reason', type: 'varchar', nullable: true, length: 100 })
  voidReason: string | null;

  @ManyToOne(() => Invoice, { nullable: true })
  @JoinColumn({ name: 'superseded_by' })
  supersededBy: Invoice | null;

  //pdf: Document | null;
}
