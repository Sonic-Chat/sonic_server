import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Chat, Prisma } from '@prisma/client';

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
}
