import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  Get,
  Injectable,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';
import { LoginRequestDto } from './dto/login-request.dto';
import { RegisterStudentRequestDto } from './dto/register-student-request.dto';
import { Reflector } from '@nestjs/core';
import { CreateBookingRequestDto } from './dto/booking-request.dto';
import { LoginAdminRequestDto } from './dto/login-admin.dto';
import { RegisterAdminRequestDto } from './dto/register-admin-request.dto';
import { CreateHostelRequestDto } from './dto/create-hostel-request.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as multerS3 from 'multer-s3';
import { UpdateHostelRequestDto } from './dto/update-hostel-request.dto';
import { ManualBookingRequestDto } from './dto/manual-booking-request.dto';
import { CreateRoomRequestDto } from './dto/create-room-request.dto';
@Injectable()
export class StudentAuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private appService: AppService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers?.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException();

    const student = await this.appService.getStudentByApiKey(token);
    if (!student) throw new UnauthorizedException();

    request['user'] = student;
    return true;
  }
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private reflector: Reflector, private appService: AppService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = request.headers?.authorization?.replace('Bearer ', '');
    if (!token) throw new UnauthorizedException();

    const admin = await this.appService.getAdminByApiKey(token);
    if (!admin) throw new UnauthorizedException();
    request['admin'] = admin;
    return true;
  }
}
@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/student/login')
  loginStudent(@Body() loginRequestDto: LoginRequestDto) {
    return this.appService.loginStudentUser(loginRequestDto);
  }

  @Post('/student/register')
  registerStudent(
    @Body() registerStudentRequestDto: RegisterStudentRequestDto,
  ) {
    return this.appService.registerStudentUser(registerStudentRequestDto);
  }

  @UseGuards(StudentAuthGuard)
  @Post('/student/reservation')
  async makeHostelReservation(
    @Request() req,
    @Body() createBookingRequestDto: CreateBookingRequestDto,
  ) {
    return this.appService.makeStudentReservation(
      req['user'].id,
      createBookingRequestDto,
    );
  }

  @Get('/student/hostels')
  getStudentHostels() {
    return this.appService.getStudentHostels();
  }

  @UseGuards(StudentAuthGuard)
  @Get('/student/bookings')
  getStudentBookings(@Request() req) {
    return this.appService.getStudentBookings(req['user'].id);
  }

  @Get('/student/hostels/:id')
  getStudentHostelDetailsById(@Param('id') id: number) {
    return this.appService.getStudentHostelById(id);
  }

  //Admin Routes
  @Post('/admin/login')
  loginAdmin(@Body() loginRequestDto: LoginAdminRequestDto) {
    return this.appService.loginAdmin(loginRequestDto);
  }
  @Post('/admin/register')
  registerAdmin(@Body() registerAdminRequestDto: RegisterAdminRequestDto) {
    return this.appService.registerAdminUser(registerAdminRequestDto);
  }

  @UseGuards(AdminAuthGuard)
  @Post('/admin/hostel')
  @UseInterceptors(FilesInterceptor('pictures'))
  createHostel(
    @Request() req,
    @Body()
    createHostelRequestDto: CreateHostelRequestDto,
    @UploadedFiles() pictures: [],
  ) {
    createHostelRequestDto.pictures = pictures.map(
      (picture: any) => picture?.location,
    );

    return this.appService.createHostel(
      req['admin'].id,
      createHostelRequestDto,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Put('/admin/hostel/:id')
  updateHostel(
    @Param('id') hostelId: number,
    @Body()
    updateHostelRequestDto: UpdateHostelRequestDto,
  ) {
    return this.appService.updateHostel(hostelId, updateHostelRequestDto);
  }

  @UseGuards(AdminAuthGuard)
  @Post('/admin/room')
  async addRoomToHostel(@Body() createRoomRequestDto: CreateRoomRequestDto) {
    return this.appService.createRoom(createRoomRequestDto);
  }

  @UseGuards(AdminAuthGuard)
  @Get('/admin/bookings')
  getHostelBookings(@Request() req) {
    return this.appService.getHostelBookings(req['admin'].id);
  }

  @UseGuards(AdminAuthGuard)
  @Get('/admin/allocations')
  getAllocationData(@Request() req) {
    return this.appService.getManualAllocationData(req['admin'].id);
  }

  @UseGuards(AdminAuthGuard)
  @Post('/admin/allocations')
  async makeManualRoomAllocation(
    @Body() bookingRequest: ManualBookingRequestDto,
  ) {
    return this.appService.makeManualStudentReservation(bookingRequest);
  }
}
