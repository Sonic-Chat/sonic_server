import { verifyDto as connectServerDtoVerify } from './../../dto/chat/connect-server.dto';
import { ChatError } from './../../enum/error-codes/chat/chat-error.enum';
import { Injectable } from '@nestjs/common';
import { Account, Message, MessageType, Prisma } from '@prisma/client';
import { ConnectServerDto } from 'src/dto/chat/connect-server.dto';
import { WebSocket as Socket } from 'ws';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateMessageDto,
  verifyDto as createMessageDtoVerify,
} from 'src/dto/chat/create-message.dto';
import { ChatService } from '../chat/chat.service';

/**
 * Service Implementation for Chat Message Module.
 */
@Injectable()
export class MessageService {
  private connectedUsers: { user: Account; socket: Socket }[] = [];

  constructor(
    private readonly prismaService: PrismaService,
    private readonly chatService: ChatService,
  ) {}

  public async getMessageModel(
    args: Prisma.MessageFindUniqueArgs,
  ): Promise<Message> {
    return await this.prismaService.message.findUnique(args);
  }

  public async createMessageModel(
    args: Prisma.MessageCreateArgs,
  ): Promise<Message> {
    return await this.prismaService.message.create(args);
  }

  /**
   * Service Implementation for connecting to server.
   * @param connectServerDto DTO Object for Connect Server Event.
   * @param client Client Socket Object
   */
  public async addConnectedUser(
    connectServerDto: ConnectServerDto,
    client: Socket,
  ): Promise<void> {
    const errors = connectServerDtoVerify(connectServerDto);

    if (errors.length !== 0) {
      client.send(
        JSON.stringify({
          type: 'error',
          errors: errors,
        }),
      );

      return;
    }

    const checkUser = this.connectedUsers.find(
      (connectedUser) =>
        connectedUser.user.id === connectServerDto.user['account']['id'],
    );

    if (checkUser) {
      client.send(
        JSON.stringify({
          type: 'error',
          errors: [ChatError.ILLEGAL_ACTION],
        }),
      );

      return;
    }

    this.connectedUsers.push({
      user: connectServerDto.user['account'],
      socket: client,
    });

    client.send(
      JSON.stringify({
        type: 'success',
        message: ['CONNECTED'],
      }),
    );
  }

  /**
   * Service Implementation for creating a message.
   * @param client Client Socket Object
   * @param createMessageDto DTO object for Create Message Object.
   */
  public async sendMessage(
    client: Socket,
    createMessageDto: CreateMessageDto,
  ): Promise<void> {
    // Validate the DTO object.
    const errors = createMessageDtoVerify(createMessageDto);

    // Send errors to client.
    if (errors.length !== 0) {
      client.send(
        JSON.stringify({
          type: 'error',
          errors: errors,
        }),
      );

      return;
    }

    // Fetch Chat Object from Database.
    const chatModel = await this.chatService.getChat({
      where: {
        id: createMessageDto.chatId,
      },
      include: {
        participants: true,
      },
    });

    // Filter out the reciever ID.
    const recieverId = chatModel['participants'].filter(
      (participant: Account) =>
        participant.id !== createMessageDto.user['account']['id'],
    )[0].id;

    // Filter the connected user if present.
    const reciever = this.connectedUsers.find(
      (user) => user.user.id === recieverId,
    );

    let messageDto: Message;

    // Save message to database.
    if (createMessageDto.type.includes('IMAGE')) {
      messageDto = await this.createMessageModel({
        data: {
          type: Object.values(MessageType).find(
            (type) => type === createMessageDto.type,
          ),
          message: createMessageDto.message,
          sentBy: {
            connect: {
              id: createMessageDto.user['account']['id'],
            },
          },
          image: {
            create: {
              imageUrl: createMessageDto.imageUrl!,
              firebaseId: createMessageDto.firebaseId,
            },
          },
          chat: {
            connect: {
              id: chatModel.id,
            },
          },
        },
      });
    } else {
      messageDto = await this.createMessageModel({
        data: {
          type: Object.values(MessageType).find(
            (type) => type === createMessageDto.type,
          ),
          message: createMessageDto.message,
          sentBy: {
            connect: {
              id: createMessageDto.user['account']['id'],
            },
          },
          chat: {
            connect: {
              id: chatModel.id,
            },
          },
        },
      });
    }

    // If reciever is connected, send the message.
    if (reciever) {
      reciever.socket.send(
        JSON.stringify({
          type: 'create-message',
          details: {
            chatId: createMessageDto.chatId,
            message: messageDto,
          },
        }),
      );
    }
  }
}
