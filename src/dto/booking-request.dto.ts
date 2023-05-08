import { IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateBookingRequestDto {
  @IsString()
  @IsNotEmpty()
  public roomId: string;

  @IsNumber()
  @IsNotEmpty()
  public amountPaid: number;

  @IsString()
  @IsNotEmpty()
  public reference: string;

  @IsObject()
  public paymentAdvice: object = {};
}
