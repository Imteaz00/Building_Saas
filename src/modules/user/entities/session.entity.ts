import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from './user.entity';

@Entity('user_session')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  @CreateDateColumn({ name: 'issued_at' })
  issuedAt: Date;

  @Column({ name: 'last_seen_at', type: 'timestamp', nullable: false })
  lastSeenAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: false })
  expiresAt: Date;

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date | null;

  @Column({ name: 'source_ip', type: 'varchar', length: 45, nullable: true })
  sourceIp: string | null;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 32,
    nullable: false,
    unique: true,
  })
  refreshToken: string;

  //user agent
}
