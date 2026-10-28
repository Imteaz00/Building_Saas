import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../company/company.entity';
import { User } from '../user/entities/user.entity';
import { Building } from '../property/entities/building.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @ManyToOne(() => Building, { nullable: true })
  building?: Building | null;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column({ type: 'varchar', nullable: false, length: 10 })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
