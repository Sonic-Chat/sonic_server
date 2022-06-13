import { IsIn, IsOptional } from 'class-validator';

export class FetchRequestsDto {
  @IsOptional()
  @IsIn(['REQUESTED', 'ACCEPTED', 'IGNORED', 'REQUESTED_TO_YOU'])
  public status: string;
}
