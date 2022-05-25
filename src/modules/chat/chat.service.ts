import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Chat, Prisma } from '@prisma/client';

/**
 * Service Implementation for Chat Messages Module.
 */
@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Service Implementation for creating a chat.
   * @param args Chat Creation Arguments.
   * @returns Newly Created Chat Object.
   */
  public async createChat(args: Prisma.ChatCreateArgs): Promise<Chat> {
    return await this.prismaService.chat.create(args);
  }
}
