import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
@Index(['email'], { unique: true, where: 'deleted_at IS NULL' })
@Index(['phone'], { unique: true, where: 'deleted_at IS NULL' })
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  legal_name: string;

  @Column({ type: 'varchar', nullable: false, length: 100 })
  trading_name: string;

  @Column({ type: 'text', nullable: false })
  address: string;

  @Column({ type: 'varchar', nullable: false, length: 50 })
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

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
