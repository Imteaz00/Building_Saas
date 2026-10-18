import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Lease } from './lease.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity()
export class LeaseOccupant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Lease, { nullable: false })
  lease: Lease;

  @ManyToOne(() => User, { nullable: true })
  occupant: User;

  @Column({ type: 'varchar', length: 50, nullable: false })
  fullname: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  email: string;
}
