import { IsNotEmpty, IsUUID } from 'class-validator';

export class FetchRequestDto {
  @IsNotEmpty()
  @IsUUID()
  public accountId: string;
}
