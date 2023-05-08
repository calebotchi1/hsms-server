import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Hostel } from './hostel.entity';
import { RoomBooking } from './room-booking.entity';

export enum ROOM_TYPES {
  ONE_IN_A_ROOM = 'ONE_IN_A_ROOM',
  TWO_IN_A_ROOM = 'TWO_IN_A_ROOM',
  FOUR_IN_A_ROOM = 'FOUR_IN_A_ROOM',
}
@Entity()
export class Room {
  @PrimaryColumn()
  id: string; //A1, B2, C2

  @Column()
  type: ROOM_TYPES;

  @Column()
  maxNumberOfStudents: number;

  @Column({ default: 0 })
  availableBeds: number;

  @Column({ default: 0 })
  numBathrooms: number;

  @Column()
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateMaxNumberOfStudents() {
    this.maxNumberOfStudents = -1;
    switch (this.type) {
      case ROOM_TYPES.FOUR_IN_A_ROOM:
        this.maxNumberOfStudents = 4;
        break;
      case ROOM_TYPES.TWO_IN_A_ROOM:
        this.maxNumberOfStudents = 2;
        break;
      case ROOM_TYPES.ONE_IN_A_ROOM:
        this.maxNumberOfStudents = 1;
        break;
    }
    this.availableBeds = this.maxNumberOfStudents;
  }

  @ManyToOne(() => Hostel, (hostel) => hostel.rooms)
  hostel: Hostel;

  @OneToMany(() => RoomBooking, (roomBooking) => roomBooking.room)
  bookings: RoomBooking[];
}
