import { ChatService } from './../chat/chat.service';
import { FriendsError } from './../../enum/error-codes/friends/friends-error.enum';
import { CreateRequestDto } from './../../dto/friends/create-request.dto';
import { PrismaService } from './../prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  Credentials,
  Friends,
  FriendStatus,
  Prisma,
  Account,
} from '@prisma/client';
import { AccountService } from '../account/account.service';
import { DeleteRequestDto } from 'src/dto/friends/delete-request.dto';
import { NotificationService } from '../notification/notification.service';
import { CredentialsService } from '../credentials/credentials.service';

/**
 * Service Implementation for Friend Requests Module.
 */
@Injectable()
export class FriendsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly accountService: AccountService,
    private readonly chatService: ChatService,
    private readonly notificationService: NotificationService,
  ) {
    this.prismaService.$on<any>('query', (event: Prisma.QueryEvent) => {
      console.log('Query: ' + event.query);
      console.log('Duration: ' + event.duration + 'ms');
    });
  }

  /**
   * Service Implementation to fetch single friend request.
   * @param args Friends Find First Arguments.
   * @returns Friends Object or null.
   */
  public async getFriendRequest(
    args: Prisma.FriendsFindFirstArgs,
  ): Promise<Friends | null> {
    return await this.prismaService.friends.findFirst(args);
  }

  /**
   * Service Implementation to fetch many friend requests.
   * @param args Friends Find Many Arguments.
   * @returns Friends Array or null.
   */
  public async getFriendRequests(
    args: Prisma.FriendsFindManyArgs,
  ): Promise<Friends[] | null> {
    return await this.prismaService.friends.findMany(args);
  }

  /**
   * Service Implementation to create friend request.
   * @param args Friends Creation Arguments.
   * @returns Friends Object.
   */
  public async createFriendRequest(
    args: Prisma.FriendsCreateArgs,
  ): Promise<Friends> {
    return await this.prismaService.friends.create(args);
  }

  /**
   * Service Implementation to update friend request.
   * @param args Friends Update Arguments.
   * @returns Friends Object.
   */
  public async updateFriendRequest(
    args: Prisma.FriendsUpdateArgs,
  ): Promise<Friends> {
    return await this.prismaService.friends.update(args);
  }

  /**
   * Service Implementation to delete friend request.
   * @param args Friends Delete Arguments.
   * @returns Friends Object.
   */
  public async deleteFriendRequest(
    args: Prisma.FriendsDeleteArgs,
  ): Promise<Friends> {
    return await this.prismaService.friends.delete(args);
  }

  /**
   * Service Implementation for creating a friend request.
   * @param user Logged In User Details.
   * @param createRequestDto DTO Object for Creating Friend Request.
   * @returns Friend Request.
   */
  public async createRequest(
    user: Credentials,
    createRequestDto: CreateRequestDto,
  ): Promise<Friends> {
    // Fetch account details for logged in user.
    const userAccount = await this.accountService.getUser({
      where: {
        credentialsId: user.id,
      },
    });

    // Fetch account details for specified user.
    const friendAccount = await this.accountService.getUser({
      where: {
        id: createRequestDto.userId,
      },
    });

    // If specified user account does not exist, throw an HTTP exception.
    if (!friendAccount) {
      throw new NotFoundException({
        message: FriendsError.USER_NOT_FOUND,
      });
    }

    // Check for pre-existing request between users.
    const checkRequest = await this.getFriendRequest({
      where: {
        AND: [
          {
            accounts: {
              some: {
                id: userAccount.id,
              },
            },
          },
          {
            accounts: {
              some: {
                id: friendAccount.id,
              },
            },
          },
        ],
      },
      include: {
        accounts: true,
      },
    });

    // If request already exists, throw an HTTP exception.
    if (checkRequest) {
      throw new BadRequestException({
        message: FriendsError.REQUEST_ALREADY_EXISTS,
      });
    }

    // Create friend request data in database.
    const request = await this.createFriendRequest({
      data: {
        accounts: {
          connect: [{ id: userAccount.id }, { id: friendAccount.id }],
        },
        requestedBy: {
          connect: {
            id: userAccount.id,
          },
        },
      },
    });

    // Fetch request details.
    const newRequest = await this.getFriendRequest({
      where: {
        id: request.id,
      },
      include: {
        accounts: true,
      },
    });

    // Send new request notification.
    await this.notificationService.sendNotification(
      friendAccount,
      {},
      {
        title: 'New request',
        body: `${userAccount.fullName} sent you a friend request.`,
      },
    );

    return newRequest;
  }

  /**
   * Service Implementation for updating a friend request.
   * @param user Logged In User Details.
   * @param params Request Update Params.
   * @returns Updated Account Object.
   */
  public async updateRequest(
    user: Credentials,
    params: {
      where: Prisma.FriendsWhereUniqueInput;
      data: Prisma.FriendsUpdateInput;
    },
  ): Promise<Friends> {
    // Extract query and updated data from params.
    const { where, data } = params;

    // Get logged in user details.
    const loggedInUser = await this.accountService.getUser({
      where: {
        credentialsId: user.id,
      },
    });

    // Get friend's account details.
    const request = await this.getFriendRequest({
      where: where,
      include: {
        accounts: true,
      },
    });

    // Throw an HTTP exception if user does not exist.
    if (!request) {
      throw new NotFoundException({
        message: FriendsError.REQUEST_NOT_FOUND,
      });
    }

    // If the status is stuck on requested, no changes can be made
    // by the requester account.
    if (
      loggedInUser.id === request.requestedById &&
      request.status === FriendStatus.REQUESTED
    ) {
      throw new BadRequestException({
        message: FriendsError.ILLEGAL_ACTION,
      });
    }

    // If the request is already accepted,
    // no further action can be taken on it.
    if (request.status === FriendStatus.ACCEPTED) {
      throw new BadRequestException({
        message: FriendsError.ILLEGAL_ACTION,
      });
    }

    // Update request and return the result.
    const updatedRequest = await this.updateFriendRequest({ data, where });

    // If the request is getting accepted, create a new chat object.
    if (params.data.status === FriendStatus.ACCEPTED) {
      await this.chatService.createChat({
        data: {
          participants: {
            connect: request['accounts'].map((account: Account) => ({
              id: account.id,
            })),
          },
        },
      });

      // Send accepted request notification.
      await this.notificationService.sendNotification(
        loggedInUser,
        {},
        {
          title: 'Request Accepted',
          body: `${
            request['accounts'].filter(
              (account: Account) => account.id !== loggedInUser.id,
            )[0].fullName
          } sent you a friend request.`,
        },
      );
    }

    return updatedRequest;
  }

  /**
   * Service Implementation for rejecting a friend request.
   * @param user Logged In User Details.
   * @param deleteRequestDto DTO Object for Deleting Friend Request.
   * @returns Deleted Account Object.
   */
  public async deleteRequest(
    user: Credentials,
    deleteRequestDto: DeleteRequestDto,
  ): Promise<Friends> {
    // Fetch logged in account details.
    const account = await this.accountService.getUser({
      where: {
        credentialsId: user.id,
      },
    });

    // Fetch the friend request data from database.
    const friend = await this.getFriendRequest({
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
            id: deleteRequestDto.id,
          },
        ],
      },
    });

    // If friend record does not exist, throw an HTTP exception.
    if (!friend) {
      throw new NotFoundException({
        message: FriendsError.REQUEST_NOT_FOUND,
      });
    }

    // Delete the record from database and return the result.
    return await this.deleteFriendRequest({
      where: {
        id: deleteRequestDto.id,
      },
    });
  }
}
