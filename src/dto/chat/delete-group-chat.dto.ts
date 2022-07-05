import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteGroupChatDto {
  @IsNotEmpty()
  @IsUUID()
  public chatId: string;
}
