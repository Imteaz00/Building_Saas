import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  //   company_id
  //   tenant_id

  @Column({ type: 'varchar', nullable: false, length: 100 })
  name: string;

  @Column({ type: 'varchar', nullable: false, length: 50, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: true, length: 15 })
  phone: string;

  //   role_enum
  //   state_enum

  @Column({ type: 'varchar', nullable: false })
  password_hash: string;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  password_updated_at: Date;

  @Column({ type: 'int', nullable: false, default: 0 })
  failed_attempt_count: number;

  @Column({ type: 'timestamp', nullable: true })
  locked_until: Date | null;

  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  last_sign_in_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  deactivated_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date | null;
}
