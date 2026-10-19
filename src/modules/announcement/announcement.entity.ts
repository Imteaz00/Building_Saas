import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Building } from '../property/entities/building.entity';
import { Unit } from '../property/entities/unit.entity';
import { User } from '../user/entities/user.entity';

@Entity('announcement')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Building, { nullable: false })
  building: Building;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column({ name: 'audience_type', type: 'enum', enum: ['building', 'units'] })
  audienceType: 'building' | 'units';

  @Column({ name: 'publish_at', type: 'timestamp' })
  publishAt: Date;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date | null;

  @Column({ name: 'withdrawn_at', type: 'timestamp', nullable: true })
  withdrawnAt?: Date | null;

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;

  @ManyToOne(() => User, { nullable: true })
  withdrawnBy?: User | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @ManyToMany(() => Unit)
  @JoinTable({
    name: 'announcement_unit',
    joinColumn: { name: 'announcement_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'unit_id', referencedColumnName: 'id' },
  })
  units: Unit[];
}
