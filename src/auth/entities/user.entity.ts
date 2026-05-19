import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { OtpEntity } from './otp';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ unique: true, name: 'user_name', type: 'varchar', nullable: true })
  userName!: string;

  @Column({ name: 'fullname', type: 'varchar' })
  fullName!: string;

  @Column({ unique: true, type: 'varchar' })
  email!: string;

  @Column({ select: false, type: 'varchar', nullable: true })
  password!: string;

  @Column({ select: false, type: 'varchar', nullable: true })
  profilePicture!: string;

  @Column({ type: 'varchar', default: 'local' })
  provider!: string;

  @ManyToOne(() => OtpEntity, (otp) => otp.user)
  otp!: OtpEntity[];

  @Column({ type: 'varchar' })
  @CreateDateColumn({ name: 'created_date' })
  createdDate!: Date;

  @UpdateDateColumn({ name: 'updated_date' })
  updatedDate!: Date;
}
