import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Company } from 'src/modules/company/company.entity';

@Entity('building')
@Index(['id', 'company'], { unique: true })
export class Building {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'building_type', type: 'varchar', nullable: true })
  buildingType: string;

  @Column({ name: 'year_built', type: 'int', nullable: true })
  yearBuilt: number;

  @Column({ name: 'floor_count', type: 'int', nullable: true })
  floorCount: number;

  @Column({ name: 'ownership_notes', type: 'text', nullable: true })
  ownershipNotes: string;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: 'active' | 'inactive';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
