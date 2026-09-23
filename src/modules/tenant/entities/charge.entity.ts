import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Lease } from './lease.entity';

@Entity()
export class LeaseChargeLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lease, { nullable: false })
  lease: Lease;

  @Column({ type: 'varchar', nullable: false, length: 20 })
  label: string;

  @Column({
    type: 'enum',
    enum: ['rent', 'service', 'utility', 'parking', 'other'],
    nullable: false,
  })
  type: 'rent' | 'service' | 'utility' | 'parking' | 'other';

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ name: 'bills_every_cycle', type: 'boolean', nullable: false })
  billsEveryCycle: boolean;

  @Column({ type: 'boolean', nullable: false })
  prorates: boolean;

  @Column({ name: 'effective_from', type: 'date', nullable: false })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo: Date | null;

  @ManyToOne(() => LeaseChargeLine, { nullable: true })
  @JoinColumn({ name: 'superseded_by' })
  supersededBy: LeaseChargeLine | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
