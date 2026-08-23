import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  legal_name: string;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  trading_name: string;

  @Column({ type: 'text', nullable: false })
  address: string;

  @Column({ type: 'varchar', nullable: false, length: 50, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: false, length: 15 })
  phone: string;

  @Column({ type: 'varchar', nullable: false, length: 20 })
  // @MaxLength(20) need to know the exact requirements
  tax_registration_id: string;

  //   logo

  @Column({ type: 'varchar', nullable: false, length: 3 })
  base_currency: string;

  @Column({ type: 'varchar', nullable: false, length: 5 })
  default_locale: string;

  @Column({ type: 'varchar', nullable: false, length: 50 })
  time_zone: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;
}
