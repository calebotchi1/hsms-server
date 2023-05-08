import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterStudentRequestDto {
  @IsString()
  @IsNotEmpty()
  public studentId: string;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public firstName: string;

  @IsString()
  @IsNotEmpty()
  public lastName: string;

  @IsString()
  @IsNotEmpty()
  public password: string;
}
