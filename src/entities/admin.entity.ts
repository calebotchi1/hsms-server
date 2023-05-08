import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Hostel } from './hostel.entity';
import { JoinColumn } from 'typeorm';

@Entity()
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, length: 30 })
  firstName: string;

  @Column({ nullable: false, length: 40 })
  lastName: string;

  @Index({ unique: true })
  @Column({ nullable: false, unique: true, length: 100 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 255, nullable: true })
  apiKey: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Hostel, (hostel) => hostel.admin)
  @JoinColumn()
  hostels: Hostel[];

  @BeforeInsert()
  generateApiKey() {
    //create a base-36 string that contains 30 chars in a-z,0-9
    this.apiKey = [...Array(30)]
      .map(() => ((Math.random() * 36) | 0).toString(36))
      .join('');
  }

  get fullName() {
    return this.firstName + ' ' + this.lastName;
  }
}
