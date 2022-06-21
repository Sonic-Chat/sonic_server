import { MarkDeliveredDto } from './../../dto/chat/mark-delivered.dto';
import { User } from './../../decorators/user.decorator';
import { AuthGuard } from './../../guards/auth.guard';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { Chat, Credentials } from '@prisma/client';

/**
 * Controller Implementation for Chat Message Module.
 */
@Controller('v1/message')
@UseGuards(AuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Controller Implementation for marking chat delivered.
   * @param user Logged In User.
   * @param markDeliveredDto DTO Implementation for marking chat delivered.
   * @returns Updated Chat.
   */
  @Post('delivery')
  public async markDelivered(
    @User() user: Credentials,
    @Body() markDeliveredDto: MarkDeliveredDto,
  ): Promise<Chat> {
    return await this.messageService.markDelivered(user, markDeliveredDto);
  }
}
