import { CreateRequestDto } from './../../dto/friends/create-request.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { User } from 'src/decorators/user.decorator';
import { Credentials, Friends } from '@prisma/client';

/**
 * Controller Implementation for Friend Requests Module.
 */
@Controller('v1/friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  /**
   * Controller Implementation for creating a friend request.
   * @param user Logged In User Details.
   * @param createRequestDto DTO Object for Friend Request Creation
   * @returns Friend Request Object.
   */
  @Post()
  @UseGuards(AuthGuard)
  public async createRequest(
    @User() user: Credentials,
    @Body() createRequestDto: CreateRequestDto,
  ): Promise<Friends> {
    return await this.friendsService.createRequest(user, createRequestDto);
  }
}
