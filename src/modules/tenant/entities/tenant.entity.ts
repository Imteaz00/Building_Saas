import { Company } from 'src/modules/company/company.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @Column({ type: 'varchar', nullable: false, length: 50 })
  fullname: string;

  @Column({ type: 'enum', enum: ['individual', 'company'], nullable: false })
  type: 'individual' | 'company';

  @Column({
    name: 'primary_email',
    type: 'varchar',
    nullable: true,
    length: 50,
  })
  primaryEmail: string;

  @Column({ type: 'varchar', nullable: false, length: 20 })
  phone: string;

  @Column({
    name: 'alternative_phone',
    type: 'varchar',
    nullable: true,
    length: 20,
  })
  alternativePhone: string;

  @Column({
    name: 'id_type',
    type: 'enum',
    enum: ['passport', 'national_id', 'drivers_license'],
    nullable: false,
  })
  idType: 'passport' | 'national_id' | 'drivers_license';

  @Column({ name: 'id_number', type: 'varchar', nullable: false, length: 50 })
  idNumber: string;

  @Column({ type: 'varchar', nullable: false, length: 50 })
  nationality: string;

  //reg_number

  @Column({
    name: 'emergency_contact_name',
    type: 'varchar',
    nullable: false,
    length: 50,
  })
  emergencyContactName: string;

  @Column({
    name: 'emergency_contact_phone',
    type: 'varchar',
    nullable: false,
    length: 20,
  })
  emergencyContactPhone: string;

  @Column({
    name: 'correspondence_address',
    type: 'varchar',
    nullable: false,
    length: 100,
  })
  correspondenceAddress: string;

  @Column({
    name: 'no_email_reason',
    type: 'varchar',
    nullable: true,
    length: 100,
  })
  noEmailReason: string;

  @Column({ type: 'varchar', nullable: true, length: 100 })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
