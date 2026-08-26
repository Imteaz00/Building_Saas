import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Unit } from './unit.entity';

@Entity('unit_default_charge')
export class UnitDefaultCharge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Unit, { nullable: false })
  unit: Unit;

  @Column({ type: 'varchar', nullable: false })
  label: string;

  @Column({ name: 'charge_kind', type: 'varchar', nullable: false })
  chargeKind: string;

  @Column({ type: 'decimal', nullable: false, precision: 10, scale: 2 })
  amount: number;

  @Column({
    name: 'bills_every_cycle',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  billsEveryCycle: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
