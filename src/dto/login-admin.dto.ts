import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAdminRequestDto {
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public password: string;
}
