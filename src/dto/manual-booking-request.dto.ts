import { IsNotEmpty, IsString } from 'class-validator';

export class ManualBookingRequestDto {
  @IsString()
  @IsNotEmpty()
  public roomId: string;

  @IsString()
  @IsNotEmpty()
  public studentId: string;
}
