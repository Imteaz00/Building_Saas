import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../user/entities/user.entity';
import { Document } from '../document/entities/document.entity';

@Entity()
@Index(['email'], { unique: true, where: 'deleted_at IS NULL' })
@Index(['phone'], { unique: true, where: 'deleted_at IS NULL' })
@Index(['slug'], { unique: true, where: 'deleted_at IS NULL' })
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'legal_name', type: 'varchar', nullable: false, length: 50 })
  legalName: string;

  @Column({
    name: 'trading_name',
    type: 'varchar',
    nullable: false,
    length: 50,
  })
  tradingName: string;

  @Column({ type: 'varchar', nullable: false, length: 20 })
  slug: string;

  @Column({ type: 'text', nullable: false })
  address: string;

  @Column({ type: 'varchar', nullable: false, length: 50 })
  email: string;

  @Column({ type: 'varchar', nullable: false, length: 15 })
  phone: string;

  @Column({
    name: 'tax_registration_id',
    type: 'varchar',
    nullable: false,
    length: 20,
  })
  // @MaxLength(20) need to know the exact requirements
  taxRegistrationId: string;

  @OneToOne(() => Document, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn([{ name: 'logo_id', referencedColumnName: 'id' }])
  logo: Document | null;

  @Column({
    name: 'base_currency',
    type: 'varchar',
    nullable: false,
    length: 3,
  })
  baseCurrency: string;

  @Column({
    name: 'default_locale',
    type: 'varchar',
    nullable: false,
    length: 5,
  })
  defaultLocale: string;

  @Column({ name: 'time_zone', type: 'varchar', nullable: false, length: 50 })
  timeZone: string;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
