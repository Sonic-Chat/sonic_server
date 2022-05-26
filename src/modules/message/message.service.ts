import {
  DeleteMessageDto,
  verifyDto as deletemessageDtoVerify,
} from './../../dto/chat/delete-message.dto';
import {
  UpdateMessageDto,
  verifyDto as updateMessageDtoVerify,
} from './../../dto/chat/update-message.dto';
import { ChatError } from './../../enum/error-codes/chat/chat-error.enum';
import { Injectable } from '@nestjs/common';
import {
  Account,
  Credentials,
  Message,
  MessageType,
  Prisma,
} from '@prisma/client';
import {
  ConnectServerDto,
  verifyDto as connectServerDtoVerify,
} from 'src/dto/chat/connect-server.dto';
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
  ): Promise<Message | null> {
    return await this.prismaService.message.findUnique(args);
  }

  public async createMessageModel(
    args: Prisma.MessageCreateArgs,
  ): Promise<Message> {
    return await this.prismaService.message.create(args);
  }

  public async updateMessageModel(
    args: Prisma.MessageUpdateArgs,
  ): Promise<Message> {
    return await this.prismaService.message.update(args);
  }

  public async deleteMessageModel(
    args: Prisma.MessageDeleteArgs,
  ): Promise<Message> {
    return await this.prismaService.message.delete(args);
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
    // Validate the DTO object.
    const errors = connectServerDtoVerify(connectServerDto);

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

    // Check if the user is already connected.
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

    // Persist the connected user details.
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
   * Service Implementation for fetching chats.
   * @param user Logged In User Details.
   * @param client Client Socket Object
   */
  public async syncMessages(client: Socket, user: Credentials): Promise<void> {
    // Fetch chats the user is part of.
    const chatModels = await this.chatService.getChats({
      where: {
        participants: {
          some: {
            credentialsId: user.id,
          },
        },
      },
      include: {
        messages: {
          include: {
            chat: true,
            image: true,
            sentBy: true,
          },
        },
        participants: true,
      },
    });

    // Send chats to the user.
    client.send(
      JSON.stringify({
        type: 'sync-chat',
        details: {
          chats: chatModels,
        },
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

  /**
   * Service Implementation for updating a message.
   * @param updateMessageDto DTO Object for Update Message Event.
   * @param client Client Socket Object
   */
  public async updateMessage(
    client: Socket,
    updateMessageDto: UpdateMessageDto,
  ): Promise<void> {
    // Validate the DTO object.
    const errors = updateMessageDtoVerify(updateMessageDto);

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

    // Check for message existence and message type.
    const checkMessage = await this.getMessageModel({
      where: {
        id: updateMessageDto.messageId,
      },
    });

    if (!checkMessage || checkMessage.type === MessageType.IMAGE) {
      client.send(
        JSON.stringify({
          type: 'error',
          errors: [ChatError.MESSAGE_MISSING],
        }),
      );

      return;
    }

    // Fetch Chat Object from Database.
    const chatModel = await this.chatService.getChat({
      where: {
        id: checkMessage.chatId,
      },
      include: {
        participants: true,
      },
    });

    // Filter out the reciever ID.
    const recieverId = chatModel['participants'].filter(
      (participant: Account) =>
        participant.id !== updateMessageDto.user['account']['id'],
    )[0].id;

    // Filter the connected user if present.
    const reciever = this.connectedUsers.find(
      (user) => user.user.id === recieverId,
    );

    // Update Message in Database.
    const messageDto = await this.updateMessageModel({
      where: {
        id: updateMessageDto.messageId,
      },
      data: {
        message: updateMessageDto.message,
      },
    });

    // If reciever is connected, send the message.
    if (reciever) {
      reciever.socket.send(
        JSON.stringify({
          type: 'update-message',
          details: {
            chatId: chatModel.id,
            message: messageDto,
          },
        }),
      );
    }
  }

  /**
   * Service Implementation for deleting a message.
   * @param deleteMessageDto DTO Object for Delete Message Event.
   * @param client Client Socket Object
   */
  public async deleteMessage(
    client: Socket,
    deleteMessageDto: DeleteMessageDto,
  ): Promise<void> {
    // Validate the DTO object.
    const errors = deletemessageDtoVerify(deleteMessageDto);

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

    // Check for message existence and message type.
    const checkMessage = await this.getMessageModel({
      where: {
        id: deleteMessageDto.messageId,
      },
    });

    if (!checkMessage) {
      client.send(
        JSON.stringify({
          type: 'error',
          errors: [ChatError.ILLEGAL_ACTION],
        }),
      );

      return;
    }

    // Fetch Chat Object from Database.
    const chatModel = await this.chatService.getChat({
      where: {
        id: checkMessage.chatId,
      },
      include: {
        participants: true,
      },
    });

    // Filter out the reciever ID.
    const recieverId = chatModel['participants'].filter(
      (participant: Account) =>
        participant.id !== deleteMessageDto.user['account']['id'],
    )[0].id;

    // Filter the connected user if present.
    const reciever = this.connectedUsers.find(
      (user) => user.user.id === recieverId,
    );

    // Delete Message from Database.
    await this.deleteMessageModel({
      where: {
        id: deleteMessageDto.messageId,
      },
    });

    // If reciever is connected, send the message.
    if (reciever) {
      reciever.socket.send(
        JSON.stringify({
          type: 'delete-message',
          details: {
            chatId: chatModel.id,
            messageId: deleteMessageDto.messageId,
          },
        }),
      );
    }
  }
}