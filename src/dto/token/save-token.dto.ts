import { IsNotEmpty } from 'class-validator';

export class SaveTokenDto {
  @IsNotEmpty()
  public token: string;
}
