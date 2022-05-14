import { FriendStatus } from '@prisma/client';
import { IsIn, IsNotEmpty } from 'class-validator';

export class FetchRequestsDto {
  @IsNotEmpty()
  @IsIn(Object.values(FriendStatus))
  public status: FriendStatus;
}
