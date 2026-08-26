import { Company } from 'src/modules/company/company.entity';
import { User } from 'src/modules/user/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notification_template')
@Index(['company', 'eventKey', 'channel'], {
  unique: true,
  where: 'deleted_at IS NULL',
})
export class NotificationTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @Column({ name: 'event_key' }) //need to know
  eventKey: string;

  @Column({ type: 'enum', enum: ['email', 'sms', 'in-app'], nullable: false })
  channel: 'email' | 'sms' | 'in-app';

  @Column({ type: 'varchar', length: 100 })
  subject: string;

  @Column({ type: 'text', nullable: false })
  body: string;

  //version

  @ManyToOne(() => User, { nullable: false })
  createdBy: User;

  @ManyToOne(() => User)
  updatedBy: User | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
