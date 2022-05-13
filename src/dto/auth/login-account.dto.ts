import { IsNotEmpty, MinLength } from 'class-validator';

export class LoginAccountDto {
  @IsNotEmpty()
  @MinLength(5)
  public username: string;

  @IsNotEmpty()
  @MinLength(5)
  public password: string;
}
