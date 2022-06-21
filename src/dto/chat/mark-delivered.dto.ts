import { IsNotEmpty, IsUUID } from 'class-validator';

export class MarkDeliveredDto {
  @IsNotEmpty()
  @IsUUID()
  public chatId: string;
}
