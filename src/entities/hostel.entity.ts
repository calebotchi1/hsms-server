import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from './room.entity';
import { RoomBooking } from './room-booking.entity';
import { Admin } from './admin.entity';

@Entity()
export class Hostel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'simple-array', nullable: true })
  pictures: string[];

  @Column()
  location: string;

  @Column({ default: 'Lorep ipsum' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Room, (room) => room.hostel, { eager: true })
  rooms: Room[];

  @OneToMany(() => RoomBooking, (roomBooking) => roomBooking.hostel)
  bookings: RoomBooking[];

  @ManyToOne(() => Admin, (admin) => admin.hostels)
  admin: Admin;
}
