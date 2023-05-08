import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { Repository } from 'typeorm';
import { RegisterAdminRequestDto } from './dto/register-admin-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterStudentRequestDto } from './dto/register-student-request.dto';
import { Hostel } from './entities/hostel.entity';
import { RoomBooking } from './entities/room-booking.entity';
import { CreateBookingRequestDto } from './dto/booking-request.dto';
import axios from 'axios';
import { Room } from './entities/room.entity';
import { LoginAdminRequestDto } from './dto/login-admin.dto';
import { Admin } from './entities/admin.entity';
import { CreateHostelRequestDto } from './dto/create-hostel-request.dto';
import { UpdateHostelRequestDto } from './dto/update-hostel-request.dto';
import { ManualBookingRequestDto } from './dto/manual-booking-request.dto';
import { CreateRoomRequestDto } from './dto/create-room-request.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Student) private studentRepository: Repository<Student>,
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    @InjectRepository(Hostel) private hostelRepository: Repository<Hostel>,
    @InjectRepository(RoomBooking)
    private roomBookingRepository: Repository<RoomBooking>,
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  //Student Functions
  async getStudentByApiKey(apiKey: string) {
    return this.studentRepository.findOneBy({
      apiKey: apiKey,
    });
  }
  //TODO: make sure you're fetching by student id
  async getStudentBookings(studentId: string) {
    return this.roomBookingRepository.findBy({ student: { id: studentId } });
  }

  async loginStudentUser(loginRequestDto: LoginRequestDto) {
    const user: Student = await this.studentRepository.findOne({
      where: {
        email: loginRequestDto.email,
        password: loginRequestDto.password,
      },
    });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return {
      token: user.apiKey,
      profile: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    };
  }

  async registerStudentUser(
    registerStudentRequestDto: RegisterStudentRequestDto,
  ) {
    try {
      const student = new Student();
      student.id = registerStudentRequestDto.studentId;
      student.email = registerStudentRequestDto.email;
      student.firstName = registerStudentRequestDto.firstName;
      student.lastName = registerStudentRequestDto.lastName;
      student.password = registerStudentRequestDto.password;

      const newStudent = await this.studentRepository.create(student);
      await this.studentRepository.insert(newStudent);

      const savedData = await this.studentRepository.findOneBy({
        id: newStudent.id,
      });
      return {
        token: savedData.apiKey,
        profile: {
          id: newStudent.id,
          fullName: newStudent.fullName,
          email: newStudent.email,
        },
      };
    } catch (e) {
      console.error(e);
    }
  }

  async makeStudentReservation(
    studentId: string,
    createBookingRequestDto: CreateBookingRequestDto,
  ) {
    const res = await axios.get(
      `https://api.paystack.co/transaction/verify/${createBookingRequestDto.reference}`,
      {
        headers: {
          Authorization:
            'Bearer ' + 'sk_test_1851d389c88c39276d1b584a0c8bd15331422a64',
        },
      },
    );

    createBookingRequestDto.paymentAdvice = res.data?.data;

    const room = await this.roomRepository.findOne({
      where: {
        id: createBookingRequestDto.roomId,
      },
      relations: ['hostel'],
    });
    await this.roomBookingRepository.insert({
      student: { id: studentId },
      room: { id: createBookingRequestDto.roomId },
      hostel: { id: room.hostel.id },
      amountPaid: createBookingRequestDto.amountPaid,
      reference: createBookingRequestDto.reference,
      paymentAdvice: createBookingRequestDto.paymentAdvice,
    });

    return this.roomRepository.update(
      { id: createBookingRequestDto.roomId },
      {
        availableBeds: () => 'availableBeds -1',
      },
    );
  }
  async getStudentHostels() {
    return this.hostelRepository.find();
  }
  async getStudentHostelById(id: number) {
    return this.hostelRepository.findOneBy({
      id: id,
    });
  }

  //Admin Functions
  async getAdminByApiKey(apiKey: string) {
    return this.adminRepository.findOneBy({
      apiKey: apiKey,
    });
  }
  async loginAdmin(loginAdminRequestDto: LoginAdminRequestDto) {
    const admin: Admin = await this.adminRepository.findOne({
      where: {
        email: loginAdminRequestDto.email,
        password: loginAdminRequestDto.password,
      },
    });
    if (!admin) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    return {
      token: admin.apiKey,
      profile: {
        id: admin.id,
        fullName: admin.fullName,
        email: admin.email,
      },
    };
  }

  async registerAdminUser(registerAdminRequestDto: RegisterAdminRequestDto) {
    const admin = this.adminRepository.create(registerAdminRequestDto);
    return this.adminRepository.insert(admin);
  }

  async createHostel(
    adminId: number,
    createHostelRequestDto: CreateHostelRequestDto,
  ) {
    const hostel = await this.hostelRepository.create({
      ...createHostelRequestDto,
      admin: { id: adminId },
      location: createHostelRequestDto.location,
      pictures: createHostelRequestDto.pictures,
      name: createHostelRequestDto.name,
      description: createHostelRequestDto.description,
    });
    return this.hostelRepository.insert(hostel);
  }
  async createRoom(createRoomRequestDto: CreateRoomRequestDto) {
    const room = await this.roomRepository.create({
      hostel: { id: createRoomRequestDto.hostelId },
      id: createRoomRequestDto.roomId,
      ...createRoomRequestDto,
    });

    return this.roomRepository.insert(room);
  }
  async updateHostel(
    hostelId: number,
    updateHostelRequestDto: UpdateHostelRequestDto,
  ) {
    console.log(updateHostelRequestDto);
    return this.hostelRepository.update(
      { id: hostelId },
      {
        ...updateHostelRequestDto,
      },
    );
  }
  async getHostelBookings(adminId: number) {
    return await this.roomBookingRepository.find({
      where: { hostel: { admin: { id: adminId } } },
    });
  }
  async getManualAllocationData(adminId: number) {
    return {
      hostels: await this.hostelRepository.findBy({ admin: { id: adminId } }),
      students: await this.studentRepository.find(),
    };
  }

  async makeManualStudentReservation({
    roomId,
    studentId,
  }: ManualBookingRequestDto) {
    const room = await this.roomRepository.findOne({
      where: {
        id: roomId,
      },
      relations: ['hostel'],
    });
    await this.roomBookingRepository.insert({
      student: { id: studentId },
      room: { id: roomId },
      hostel: { id: room.hostel.id },
      amountPaid: 0, //Since it is a manual reservation payments would be handles off platform
      reference: Date.now().toString(),
      paymentAdvice: {},
    });

    return this.roomRepository.update(
      { id: roomId },
      {
        availableBeds: () => 'availableBeds -1',
      },
    );
  }
}
