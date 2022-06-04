import { IsEmail, IsOptional, MinLength } from 'class-validator';

export class UpdateCredentialsDto {
  @IsOptional()
  @IsEmail()
  public email?: string;

  @IsOptional()
  @MinLength(5)
  public password?: string;

  @IsOptional()
  @MinLength(5)
  public oldPassword?: string;

  @IsOptional()
  @MinLength(5)
  public newPassword?: string;
}
