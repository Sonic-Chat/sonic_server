import { IsNotEmpty, IsUUID } from 'class-validator';

export class FetchCredentialsDto {
  @IsNotEmpty()
  @IsUUID()
  public accountId: string;
}
