import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

import { Document } from './document.entity';

@Entity('document_link')
export class DocumentLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Document, { nullable: false })
  document: Document;

  @Column({ name: 'owner_type', type: 'varchar', nullable: false })
  ownerType: string;

  @Column({ name: 'owner_id', type: 'varchar', nullable: false })
  ownerId: string;

  //link role

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
