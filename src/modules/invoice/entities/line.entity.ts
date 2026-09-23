import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { LeaseChargeLine } from 'src/modules/tenant/entities/charge.entity';

@Entity()
export class InvoiceLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, { nullable: false })
  invoice: Invoice;

  @ManyToOne(() => LeaseChargeLine, { nullable: false })
  source: LeaseChargeLine;

  @ManyToOne(() => InvoiceLine, { nullable: true })
  related?: Invoice | null;

  @Column({ type: 'varchar', nullable: false, length: 20 })
  label: string;

  @Column({
    name: 'charge_type',
    type: 'enum',
    enum: ['rent', 'service_charge', 'parking', 'other'],
    nullable: false,
  })
  chargeType: 'rent' | 'service_charge' | 'parking' | 'other';

  @Column({
    name: 'source_type',
    type: 'enum',
    enum: ['recurring', 'one_off', 'late_fee', 'recharge', 'utility'],
    nullable: false,
  })
  sourceType: 'recurring' | 'one_off' | 'late_fee' | 'recharge' | 'utility';

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ name: 'is_prorated', type: 'boolean', nullable: false })
  isProrated: boolean;

  @Column({ name: 'proration_days', type: 'int', nullable: true })
  prorationDays?: number | null;

  @Column({
    name: 'proration_divisor',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  prorationDivisor?: number | null;

  @Column({
    name: 'sort_order',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
