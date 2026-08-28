import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity()
export class Verification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @Column({ type: 'enum', enum: ['activation', 'reset'], nullable: false })
  purpose: 'activation' | 'reset';

  @Column({ name: 'token_hash', type: 'varchar', nullable: false, length: 255 })
  tokenHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: false })
  expiresAt: Date;

  @DeleteDateColumn({ name: 'used_at', type: 'timestamp', nullable: true })
  usedAt: Date | null;
}
