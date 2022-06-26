import { ChatError } from './../../enum/error-codes/chat/chat-error.enum';
import { CreateGroupChatDto } from './../../dto/chat/create-group-chat.dto';
import { PrismaService } from './../prisma/prisma.service';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Chat,
  ChatType,
  Credentials,
  FriendStatus,
  Prisma,
} from '@prisma/client';
import { FriendsService } from '../friends/friends.service';

/**
 * Service Implementation for Chat Messages Module.
 */
@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {
    this.prismaService.$on<any>('query', (event: Prisma.QueryEvent) => {
      console.log('Query: ' + event.query);
      console.log('Duration: ' + event.duration + 'ms');
    });
  }

  /**
   * Service Implementation for getting chats.
   * @param args Chat Fetch Arguments.
   * @returns Chat Object Array.
   */
  public async getChats(args: Prisma.ChatFindManyArgs): Promise<Chat[]> {
    return await this.prismaService.chat.findMany(args);
  }

  /**
   * Service Implementation for getting a chat.
   * @param args Chat Fetch Arguments.
   * @returns Chat Object.
   */
  public async getChat(args: Prisma.ChatFindUniqueArgs): Promise<Chat> {
    return await this.prismaService.chat.findUnique(args);
  }

  /**
   * Service Implementation for creating a chat.
   * @param args Chat Creation Arguments.
   * @returns Newly Created Chat Object.
   */
  public async createChat(args: Prisma.ChatCreateArgs): Promise<Chat> {
    return await this.prismaService.chat.create(args);
  }

  /**
   * Service Implementation for updating chat.
   * @param args Chat Update Arguments.
   * @returns Updated Chat Object.
   */
  public async updateChat(args: Prisma.ChatUpdateArgs): Promise<Chat> {
    return await this.prismaService.chat.update(args);
  }

  /**
   * Service Implementation for updating many chat.
   * @param args Chat Update Many Arguments.
   */
  public async updateChats(args: Prisma.ChatUpdateManyArgs): Promise<void> {
    await this.prismaService.chat.updateMany(args);
  }

  /**
   * Service Implementation for creation of group chats.
   * @param user Logged In User.
   * @param createGroupChatDto DTO Implementation for creation of group chats.
   * @returns Newly Created Group Chat.
   */
  public async createGroupChatService(
    user: Credentials,
    createGroupChatDto: CreateGroupChatDto,
  ): Promise<Chat> {
    // Check if any of the accounts is not friends with the logged in account.
    for (let participantId of createGroupChatDto.participants) {
      const checkRequest = await this.prismaService.friends.findFirst({
        where: {
          AND: [
            {
              accounts: {
                some: {
                  id: user['account']['id'],
                },
              },
            },
            {
              accounts: {
                some: {
                  id: participantId,
                },
              },
            },
          ],
        },
      });

      if (!checkRequest) {
        throw new BadRequestException({
          message: ChatError.NOT_FRIENDS,
        });
      } else if (checkRequest.status !== FriendStatus.ACCEPTED) {
        throw new BadRequestException({
          message: ChatError.NOT_FRIENDS,
        });
      }
    }

    // Create the new group chat object.
    return await this.createChat({
      data: {
        participants: {
          connect: createGroupChatDto.participants.map((id) => ({
            id,
          })),
        },
        type: ChatType.GROUP,
        name: createGroupChatDto.name,
        imageUrl: createGroupChatDto.imageUrl,
      },
      include: {
        messages: {
          include: {
            chat: true,
            image: true,
            sentBy: true,
          },
        },
        seen: true,
        delivered: true,
        participants: true,
      },
    });
  }
}
