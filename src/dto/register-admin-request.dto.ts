import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterAdminRequestDto {
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
