import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Hostel } from './hostel.entity';
import { Room } from './room.entity';
import { Student } from './student.entity';

@Entity()
export class RoomBooking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, (student) => student.bookings, { eager: true })
  student: Student;

  @ManyToOne(() => Hostel, (hostel) => hostel.bookings, { eager: true })
  hostel: Hostel;

  @ManyToOne(() => Room, (room) => room.bookings, { eager: true })
  room: Room;

  @Column({ nullable: true })
  amountPaid: number; //Duplicate here since price can change for different semesters

  @Column()
  reference: string;

  @Column('simple-json')
  paymentAdvice: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
