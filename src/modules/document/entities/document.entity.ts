import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Company } from '../../company/company.entity';
import { User } from '../../user/user.entity';

@Entity('document')
@Index(['id', 'company'], { unique: true })
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  //storage_key

  @Column({ name: 'original_filename', type: 'varchar', nullable: false })
  originalFileName: string;

  @Column({ name: 'mime_type', type: 'varchar', nullable: false })
  mimeType: string;

  @Column({ name: 'byte_size', type: 'int', nullable: false })
  byteSize: number;

  @Column({ name: 'checksum', type: 'varchar', nullable: false })
  checksum: string;

  //preview_storage_key

  @ManyToOne(() => User, { nullable: false })
  uploadedBy: User;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @Column({
    name: 'is_financial_evidence',
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isFinancialEvidence: boolean;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => User)
  deletedBy: User | null;
}
