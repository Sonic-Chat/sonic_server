import { FriendsError } from './../../enum/error-codes/friends/friends-error.enum';
import { CreateRequestDto } from './../../dto/friends/create-request.dto';
import { PrismaService } from './../prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Credentials, Friends, FriendStatus } from '@prisma/client';
import { AccountService } from '../account/account.service';

/**
 * Service Implementation for Friend Requests Module.
 */
@Injectable()
export class FriendsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly accountService: AccountService,
  ) {}

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
      credentialsId: user.id,
    });

    // Fetch account details for specified user.
    const friendAccount = await this.accountService.getUser({
      id: createRequestDto.userId,
    });

    // If specified user account does not exist, throw an HTTP exception.
    if (!friendAccount) {
      throw new NotFoundException({
        message: FriendsError.USER_NOT_FOUND,
      });
    }

    // Check for pre-existing request between users.
    const checkRequest = await this.prismaService.friends.findFirst({
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
    const request = await this.prismaService.friends.create({
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

    // Return data to the client.
    return await this.prismaService.friends.findFirst({
      where: {
        id: request.id,
      },
      include: {
        accounts: true,
      },
    });
  }
}
