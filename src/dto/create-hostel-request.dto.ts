import { IsNotEmpty, IsString } from 'class-validator';

export class CreateHostelRequestDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public location: string;

  @IsString()
  @IsNotEmpty()
  public description: string;

  public pictures: string[];
}
