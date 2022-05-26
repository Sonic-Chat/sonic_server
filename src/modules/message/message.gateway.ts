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
  public async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() connectServerDto: ConnectServerDto,
  ): Promise<void> {
    return this.messageService.addConnectedUser(connectServerDto, client);
  }
}
