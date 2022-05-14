import { FriendStatus } from '@prisma/client';
import { IsEnum, IsIn, IsNotEmpty, IsUUID } from 'class-validator';

export class UpdateRequestDto {
  @IsNotEmpty()
  @IsUUID()
  public id: string;

  @IsNotEmpty()
  @IsIn(Object.values(FriendStatus))
  public status: FriendStatus;
}
