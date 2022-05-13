import { FriendStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdatyeRequestDto {
  @IsNotEmpty()
  @IsUUID()
  public id: string;

  @IsNotEmpty()
  @IsEnum(FriendStatus)
  public status: FriendStatus;
}
