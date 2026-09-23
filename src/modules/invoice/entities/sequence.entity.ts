import { Delete } from '@nestjs/common';
import { Company } from 'src/modules/company/company.entity';
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

@Entity()
@Index(['company', 'type'], { unique: true })
export class NumberSequence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false })
  company: Company;

  @Column({
    type: 'enum',
    enum: ['invoice', 'receipt', 'ticket'],
    nullable: false,
  })
  type: 'invoice' | 'receipt' | 'ticket';

  @Column({ type: 'varchar', nullable: false, length: 3 })
  prefix: string;

  @Column({ name: 'next_value', type: 'int', nullable: false })
  nextValue: number;

  @Column({ name: 'resets_annually', type: 'boolean', nullable: false })
  resetsAnnually: boolean;

  @Column({ name: 'current_year', type: 'int', nullable: false })
  currentYear: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
