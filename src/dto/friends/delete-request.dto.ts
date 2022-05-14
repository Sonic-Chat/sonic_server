import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteRequestDto {
  @IsNotEmpty()
  @IsUUID()
  public id: string;
}
