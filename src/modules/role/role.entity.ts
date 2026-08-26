import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Index(['name', 'module', 'action'], {
  unique: true,
  where: 'deleted_at IS NULL',
})
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false, length: 10 })
  name: string;

  @Column({ type: 'varchar', nullable: false, length: 20 })
  module: string;

  @Column({
    type: 'enum',
    enum: ['view', 'create', 'edit', 'delete', 'approve'],
    nullable: false,
  })
  action: 'view' | 'create' | 'edit' | 'delete' | 'approve';

  @Column({ type: 'enum', enum: ['F', 'E', 'V', 'O'], nullable: true })
  type: 'F' | 'E' | 'V' | 'O';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
