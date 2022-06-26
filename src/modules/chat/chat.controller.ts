import { CreateGroupChatDto } from './../../dto/chat/create-group-chat.dto';
import { ChatService } from './chat.service';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { User } from 'src/decorators/user.decorator';
import { Chat, Credentials } from '@prisma/client';

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
}
