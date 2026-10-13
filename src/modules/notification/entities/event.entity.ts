import { Company } from 'src/modules/company/company.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notification_event')
export class NotificationEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @Column({ name: 'event_key', nullable: false }) //need to know
  eventKey: string;

  @Column({ name: 'target_type', nullable: false })
  targetType: string;

  @Column({ name: 'target_id', nullable: false })
  targetId: string;

  @Column({ name: 'raised_by_module', nullable: false })
  raisedByModule: string;

  @Column({ type: 'json', nullable: false })
  payload: Record<string, unknown>;

  @CreateDateColumn({ name: 'raised_at' })
  raisedAt: Date;
}
