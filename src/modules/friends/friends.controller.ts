import { CreateRequestDto } from './../../dto/friends/create-request.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { User } from 'src/decorators/user.decorator';
import { Credentials, Friends } from '@prisma/client';
import { UpdateRequestDto } from 'src/dto/friends/update-request.dto';
import { DeleteRequestDto } from 'src/dto/friends/delete-request.dto';
import { AccountService } from '../account/account.service';
import { fetchRequestDto } from 'src/dto/friends/fetch-request.dto';
import { FriendsError } from 'src/enum/error-codes/friends/friends-error.enum';

/**
 * Controller Implementation for Friend Requests Module.
 */
@Controller('v1/friends')
export class FriendsController {
  constructor(
    private readonly friendsService: FriendsService,
    private readonly accountService: AccountService,
  ) {}

  /**
   * Controller Implementation for fetching a friend request.
   * @param user Logged In User Details
   * @param fetchRequestDto DTO Object to Fetch Friend Request
   * @returns Friend Request Object or error.
   */
  @Get('account')
  @UseGuards(AuthGuard)
  public async getFriendRequest(
    @User() user: Credentials,
    @Query() fetchRequestDto: fetchRequestDto,
  ): Promise<Friends | null> {
    // Fetching logged in user account details.
    const account = await this.accountService.getUser({
      credentialsId: user.id,
    });

    // Fetching request from database.
    const checkRequest = await this.friendsService.getFriendRequest({
      where: {
        AND: [
          {
            accounts: {
              some: {
                id: account.id,
              },
            },
          },
          {
            accounts: {
              some: {
                id: fetchRequestDto.accountId,
              },
            },
          },
        ],
      },
      include: {
        accounts: true,
      },
    });

    // If request does not exists, throw an HTTP exception.
    if (!checkRequest) {
      throw new NotFoundException({
        message: FriendsError.REQUEST_NOT_FOUND,
      });
    }
    // Else return the result.
    else {
      return checkRequest;
    }
  }

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
