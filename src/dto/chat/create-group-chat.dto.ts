import {
  ArrayMinSize,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateGroupChatDto {
  @ArrayMinSize(1)
  @IsUUID(null, { each: true })
  public participants: string[];

  @IsNotEmpty()
  public name: string;

  @IsOptional()
  @IsUrl()
  public imageUrl: string;
}
