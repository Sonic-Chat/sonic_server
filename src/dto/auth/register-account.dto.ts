import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  MinLength,
} from 'class-validator';

export class RegisterAccountDto {
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsNotEmpty()
  @MinLength(5)
  public username: string;

  @IsNotEmpty()
  @MinLength(5)
  public password: string;

  @IsNotEmpty()
  @MinLength(5)
  public fullName: string;

  @IsUrl()
  @IsOptional()
  public imageUrl?: string;
}
