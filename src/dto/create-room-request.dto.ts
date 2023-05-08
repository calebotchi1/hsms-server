import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ROOM_TYPES } from '../entities/room.entity';

export class CreateRoomRequestDto {
  @IsNumber()
  @IsNotEmpty()
  public hostelId: number;

  @IsString()
  @IsNotEmpty()
  public roomId: string;

  @IsNumber()
  @IsNotEmpty()
  public price: number;

  @IsNumber()
  @IsNotEmpty()
  public numBathrooms: number;

  @IsString()
  @IsNotEmpty()
  public type: ROOM_TYPES;
}
