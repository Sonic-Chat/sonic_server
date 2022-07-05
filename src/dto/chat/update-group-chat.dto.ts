import {
  ArrayMinSize,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class UpdateGroupChatDto {
  @IsNotEmpty()
  @IsUUID()
  public chatId: string;

  @IsNotEmpty()
  @ArrayMinSize(1)
  @IsUUID(null, { each: true })
  public participants: string[];

  @IsNotEmpty()
  public name: string;

  @IsOptional()
  @IsUrl()
  public imageUrl: string;
}
