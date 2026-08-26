import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { NotificationEvent } from './event.entity';
import { NotificationTemplate } from './template.entity';
import { User } from 'src/modules/user/user.entity';

@Entity('notification_delivery')
@Index(['event', 'recipient', 'channel'], { unique: true })
export class NotificationDelivery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => NotificationEvent, { nullable: false })
  event: NotificationEvent;

  @ManyToOne(() => NotificationTemplate, { nullable: false })
  template: NotificationTemplate;

  //version

  @ManyToOne(() => User, { nullable: false })
  recipient: User;

  //recipient tenant

  @Column({ name: 'recipient_address', type: 'varchar', nullable: false })
  recipientAddress: string;

  @Column({ type: 'enum', enum: ['email', 'sms', 'in-app'], nullable: false })
  channel: 'email' | 'sms' | 'in-app';

  @Column({
    type: 'enum',
    enum: [
      'queued',
      'sent',
      'failed',
      'undeliverable',
      'suppressed',
      'skipped',
    ],
    nullable: false,
  })
  status:
    'queued' | 'sent' | 'failed' | 'undeliverable' | 'suppressed' | 'skipped';

  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ name: 'attempt_count', type: 'int', nullable: false, default: 0 })
  attemptCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'last_attempt_at', nullable: true })
  lastAttemptAt: Date | null;
}
