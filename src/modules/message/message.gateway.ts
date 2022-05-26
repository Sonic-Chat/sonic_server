import { DeleteMessageDto } from './../../dto/chat/delete-message.dto';
import { UpdateMessageDto } from './../../dto/chat/update-message.dto';
import { CreateMessageDto } from 'src/dto/chat/create-message.dto';
import { ConnectServerDto } from './../../dto/chat/connect-server.dto';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { WebSocket as Socket } from 'ws';
import { WSAuthGuard } from 'src/guards/ws-auth.guard';
import { UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { Credentials } from '@prisma/client';

/**
 * Controller Implementation for Chat Message Module.
 */
@WebSocketGateway()
export class MessageGateway {
  constructor(private readonly messageService: MessageService) {}

  /**
   * Controller Implementation for connecting to server.
   * @param connectServerDto DTO Object for Connect Server Event.
   * @param client Client Socket Object
   */
  @SubscribeMessage('connect')
  @UseGuards(WSAuthGuard)
  public async addConnectedUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() connectServerDto: ConnectServerDto,
  ): Promise<void> {
    return this.messageService.addConnectedUser(connectServerDto, client);
  }

  /**
   * Controller Implementation for disconnecting from server.
   * @param user Logged In User
   */
  @SubscribeMessage('disconnect')
  @UseGuards(WSAuthGuard)
  public async disconnectUser(@MessageBody() user: any): Promise<void> {
    return this.messageService.disonnectUser(user.user);
  }

  /**
   * Controller Implementation for fetching chats.
   * @param user Logged In User Details.
   * @param client Client Socket Object
   */
  @SubscribeMessage('sync-message')
  @UseGuards(WSAuthGuard)
  public async syncMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() user: Credentials,
  ): Promise<void> {
    return this.messageService.syncMessages(client, user);
  }

  /**
   * Controller Implementation for creating a message.
   * @param createMessageDto DTO Object for Create Message Event.
   * @param client Client Socket Object
   */
  @SubscribeMessage('create-message')
  @UseGuards(WSAuthGuard)
  public async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ): Promise<void> {
    return this.messageService.sendMessage(client, createMessageDto);
  }

  /**
   * Controller Implementation for updating a message.
   * @param updateMessageDto DTO Object for Update Message Event.
   * @param client Client Socket Object
   */
  @SubscribeMessage('update-message')
  @UseGuards(WSAuthGuard)
  public async updateMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() updateMessageDto: UpdateMessageDto,
  ): Promise<void> {
    return this.messageService.updateMessage(client, updateMessageDto);
  }

  /**
   * Controller Implementation for deleting a message.
   * @param deleteMessageDto DTO Object for Delete Message Event.
   * @param client Client Socket Object
   */
  @SubscribeMessage('delete-message')
  @UseGuards(WSAuthGuard)
  public async deleteMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() deleteMessageDto: DeleteMessageDto,
  ): Promise<void> {
    return this.messageService.deleteMessage(client, deleteMessageDto);
  }
}
