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

  @Column({ name: 'event_key' }) //need to know
  eventKey: string;

  @Column({ name: 'target_type' })
  targetType: string;

  @Column({ name: 'target_id' })
  targetId: string;

  @Column({ name: 'raised_by   ' })
  raisedBy: string;

  @Column({ type: 'json', nullable: false })
  payload: string;

  @CreateDateColumn({ name: 'raised_at' })
  raisedAt: Date;
}
