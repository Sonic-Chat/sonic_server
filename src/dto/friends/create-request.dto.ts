import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateRequestDto {
  @IsNotEmpty()
  @IsUUID()
  public userId: string;
}
