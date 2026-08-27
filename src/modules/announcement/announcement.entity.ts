import {
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Building } from '../property/entities/building.entity';
import { Company } from '../company/company.entity';
import { Unit } from '../property/entities/unit.entity';

@Entity('announcement')
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @ManyToOne(() => Building, { nullable: false })
  building: Building;

  @ManyToMany(() => Unit)
  @JoinTable({
    name: 'announcement_unit',
    joinColumn: { name: 'announcement_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'unit_id', referencedColumnName: 'id' },
  })
  units: Unit[];
}
