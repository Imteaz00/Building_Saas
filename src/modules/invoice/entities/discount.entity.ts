import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Invoice } from './invoice.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class InvoiceDiscount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Invoice, { nullable: false })
  invoice: Invoice;

  @Column({ type: 'enum', enum: ['percentage', 'fixed'], nullable: false })
  basis: 'percentage' | 'fixed';

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  value: number;

  @Column({
    name: 'computed_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  computedAmount: number;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  reason: string;

  @ManyToOne(() => User, { nullable: false })
  by: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
