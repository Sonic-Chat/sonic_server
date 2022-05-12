import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsUrl()
  public imageUrl?: string;

  @IsNotEmpty()
  public fullName: string;

  @IsNotEmpty()
  public status: string;
}
