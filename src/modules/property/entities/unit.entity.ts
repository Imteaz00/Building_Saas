import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Building } from './building.entity';
import { Company } from 'src/modules/company/company.entity';

@Entity('unit')
@Index(['id', 'unitNumber'], { unique: true })
export class Unit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //company

  @ManyToOne(() => Building, { nullable: false })
  @JoinColumn([
    { name: 'building_id', referencedColumnName: 'id' },
    { name: 'company_id', referencedColumnName: 'company' },
  ])
  building: Building;

  @Column({ name: 'unit_number', type: 'varchar', nullable: false })
  unitNumber: string;

  @Column({
    name: 'unit_type',
    type: 'enum',
    enum: ['apartment', 'commercial', 'parking', 'common_area'],
    nullable: false,
  })
  unitType: 'apartment' | 'commercial' | 'parking' | 'common_area';

  @Column({ type: 'int', nullable: true })
  floor: number;

  @Column({ type: 'int', nullable: true })
  size: number;

  @Column({
    name: 'size_unit',
    type: 'enum',
    enum: ['sqft', 'sqm'],
    nullable: true,
  })
  sizeUnit: 'sqft' | 'sqm';

  @Column({ name: 'bedroom_count', type: 'int', nullable: true })
  bedroomCount: number;

  @Column({ name: 'bathroom_count', type: 'int', nullable: true })
  bathroomCount: number;

  @Column({
    name: 'occupancy_status',
    type: 'enum',
    enum: ['occupied', 'vacant', 'reserved', 'unavailable'],
    nullable: false,
  })
  occupancyStatus: 'occupied' | 'vacant' | 'reserved' | 'unavailable';
  @Column({ name: 'unavailable_reason', type: 'varchar', nullable: true })
  unavailableReason: string;

  @Column({ name: 'expected_return_date', type: 'date', nullable: true })
  expectedReturnDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
