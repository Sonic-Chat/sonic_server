import { MinLength } from 'class-validator';

export class DeleteCredentialsDto {
  @MinLength(5)
  public password: string;
}
