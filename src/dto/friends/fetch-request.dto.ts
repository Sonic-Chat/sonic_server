import { IsNotEmpty, IsUUID } from 'class-validator';

export class fetchRequestDto {
  @IsNotEmpty()
  @IsUUID()
  public accountId: string;
}
