import { CreateGroupChatDto } from './../../dto/chat/create-group-chat.dto';
import { ChatService } from './chat.service';
import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { Chat, Credentials } from '@prisma/client';
import { UpdateGroupChatDto } from 'src/dto/chat/update-group-chat.dto';

/**
 * Controller Implementation for Chat Module.
 */
@Controller('v1/chat')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Controller Implementation for creation of group chats.
   * @param user Logged In User.
   * @param createGroupChatDto DTO Implementation for creation of group chats.
   * @returns Newly Created Chat.
   */
  @Post('group')
  public async createGroupChatService(
    @User() user: Credentials,
    @Body() createGroupChatDto: CreateGroupChatDto,
  ): Promise<Chat> {
    return await this.chatService.createGroupChatService(
      user,
      createGroupChatDto,
    );
  }

  /**
   * Controller Implementation for updating group chat.
   * @param user Logged In User.
   * @param updateGroupChatDto DTO Implementation for updating group chat.
   * @returns Updated Chat.
   */
  @Put('group')
  public async updateGroupChatService(
    @User() user: Credentials,
    @Body() updateGroupChatDto: UpdateGroupChatDto,
  ): Promise<Chat> {
    return await this.chatService.updateGroupChatService(
      user,
      updateGroupChatDto,
    );
  }
}
