import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';

@Entity('notification_preference')
export class NotificationPreference {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false })
  user: User;

  //tenant id

  @Column({ name: 'event_category', type: 'varchar', nullable: false })
  eventCategory: string;

  @Column({ type: 'enum', enum: ['email', 'sms', 'in-app'], nullable: false })
  channel: 'email' | 'sms' | 'in-app';

  @Column({ name: 'enabled', type: 'boolean', nullable: false, default: true })
  enabled: boolean;

  @ManyToOne(() => User, { nullable: false })
  overriddenBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
