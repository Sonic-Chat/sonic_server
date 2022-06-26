import {
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateGroupChatDto {
  @MinLength(1, { each: true })
  @IsUUID(null, { each: true })
  public participants: string[];

  @IsNotEmpty()
  public name: string;

  @IsOptional()
  @IsUrl()
  public imageUrl: string;
}
