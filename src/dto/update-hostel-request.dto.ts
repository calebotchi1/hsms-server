import { IsOptional, IsString } from 'class-validator';

export class UpdateHostelRequestDto {
  @IsString()
  @IsOptional()
  public name: string;

  @IsString()
  @IsOptional()
  public location: string;

  @IsString()
  @IsOptional()
  public description: string;
}
