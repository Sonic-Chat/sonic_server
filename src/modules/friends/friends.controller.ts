import { CreateRequestDto } from './../../dto/friends/create-request.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { Body, Controller, Delete, Post, Put, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { User } from 'src/decorators/user.decorator';
import { Credentials, Friends } from '@prisma/client';
import { UpdateRequestDto } from 'src/dto/friends/update-request.dto';
import { DeleteRequestDto } from 'src/dto/friends/delete-request.dto';

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

  /**
   * Controller Implementation for updating a friend request.
   * @param user Logged In User Details.
   * @param updateRequestDto DTO Object for Updating Friend Request.
   * @returns Updated Friend Request.
   */
  @Put()
  @UseGuards(AuthGuard)
  public async updateRequest(
    @User() user: Credentials,
    @Body() updateRequestDto: UpdateRequestDto,
  ): Promise<Friends> {
    return await this.friendsService.updateRequest(user, {
      where: {
        id: updateRequestDto.id,
      },
      data: {
        status: updateRequestDto.status,
      },
    });
  }

  /**
   * Controller Implementation for rejecting a friend request.
   * @param user Logged In User Details.
   * @param deleteRequestDto DTO Object for Deleting Friend Request.
   * @returns Deleted Friend Request.
   */
  @Delete()
  @UseGuards(AuthGuard)
  public async deleteRequest(
    @User() user: Credentials,
    @Body() deleteRequestDto: DeleteRequestDto,
  ): Promise<Friends> {
    return await this.friendsService.deleteRequest(user, deleteRequestDto);
  }
}
