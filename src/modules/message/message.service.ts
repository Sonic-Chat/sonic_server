import {
  MarkSeenDto,
  verifyDto as markSeenDtoVerify,
} from './../../dto/chat/mark-seen.dto';
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
import { NotificationService } from '../notification/notification.service';

/**
 * Service Implementation for Chat Message Module.
 */
@Injectable()
export class MessageService {
  private connectedUsers: { user: Account; socket: Socket }[] = [];

  constructor(
    private readonly prismaService: PrismaService,
    private readonly chatService: ChatService,
    private readonly notificationService: NotificationService,
  ) {
    this.prismaService.$on<any>('query', (event: Prisma.QueryEvent) => {
      console.log('Query: ' + event.query);
      console.log('Duration: ' + event.duration + 'ms');
    });
  }

  /**
   * Service Implementation to fetch message.
   * @param args Message Find Unique Args
   * @returns Message Object
   */
  public async getMessageModel(
    args: Prisma.MessageFindUniqueArgs,
  ): Promise<Message | null> {
    return await this.prismaService.message.findUnique(args);
  }

  /**
   * Service Implementation to create message.
   * @param args Message Create Args
   * @returns Message Object
   */
  public async createMessageModel(
    args: Prisma.MessageCreateArgs,
  ): Promise<Message> {
    return await this.prismaService.message.create(args);
  }

  /**
   * Service Implementation to update message.
   * @param args Message Update Args
   * @returns Message Object
   */
  public async updateMessageModel(
    args: Prisma.MessageUpdateArgs,
  ): Promise<Message> {
    return await this.prismaService.message.update(args);
  }

  /**
   * Service Implementation to delete message.
   * @param args Message Delete Args
   * @returns Message Object
   */
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
   * Service Implementation for disconnecting server.
   * @param user Logged In User.
   */
  public async disonnectUser(user: Credentials): Promise<void> {
    this.connectedUsers = this.connectedUsers.filter(
      (connectedUser) => connectedUser.user.id !== user['account']['id'],
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
    });

    // Update delivered status.
    for (const chatModel of chatModels) {
      await this.chatService.updateChat({
        where: {
          id: chatModel.id,
        },
        data: {
          delivered: {
            connect: [
              {
                id: user['user']['account']['id'],
              },
            ],
          },
        },
      });
    }

    // Fetch updated chat models.
    const updatedChatModels = await this.chatService.getChats({
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
        seen: true,
        delivered: true,
        participants: true,
      },
    });

    // Send chats to the user.
    client.send(
      JSON.stringify({
        type: 'sync-chat',
        details: {
          chats: updatedChatModels,
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

    // Set message as seen.
    await this.chatService.updateChat({
      where: {
        id: chatModel.id,
      },
      data: {
        seen: {
          set: [
            {
              credentialsId: createMessageDto.user.id,
            },
          ],
        },
      },
    });

    // If reciever is connected, send the message.
    if (reciever) {
      // Set message as delivered.
      await this.chatService.updateChat({
        where: {
          id: chatModel.id,
        },
        data: {
          delivered: {
            connect: [
              {
                id: reciever.user.id,
              },
            ],
          },
        },
      });

      reciever.socket.send(
        JSON.stringify({
          type: 'create-message',
          details: {
            chatId: createMessageDto.chatId,
            message: messageDto,
          },
        }),
      );
    } else {
      let body = '';

      // Body for the notification.
      switch (createMessageDto.type) {
        case MessageType.IMAGE: {
          body = 'Image 📸';
          break;
        }
        case MessageType.IMAGE_TEXT: {
          body = `📸 ${createMessageDto.message!}`;
          break;
        }
        case MessageType.TEXT: {
          body = createMessageDto.message!;
          break;
        }
        default: {
          body = 'New Message';
        }
      }

      // Send notification to recipient.
      await this.notificationService.sendNotification(
        reciever.user,
        {
          type: 'create-message',
          details: {
            chatId: createMessageDto.chatId,
            message: messageDto,
          },
        },
        {
          title: `${reciever.user.fullName} sent a message`,
          body,
        },
      );
    }

    // Send create message event to the sender too.
    client.send(
      JSON.stringify({
        type: 'create-message',
        details: {
          chatId: createMessageDto.chatId,
          message: messageDto,
        },
      }),
    );
  }

  /**
   * Service Implementation for marking a chat seen.
   * @param client Client Socket
   * @param markSeenDto DTO Implementation for marking a chat seen.
   */
  public async markChatSeen(
    client: Socket,
    markSeenDto: MarkSeenDto,
  ): Promise<void> {
    // Validate the DTO object.
    const errors = markSeenDtoVerify(markSeenDto);

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

    // Validating chat ID.
    const checkChat = await this.chatService.getChat({
      where: {
        id: markSeenDto.chatId,
      },
    });

    // If chat does not exist, send error.
    if (!checkChat) {
      client.send(
        JSON.stringify({
          type: 'error',
          errors: [ChatError.CHAT_UID_ILLEGAL],
        }),
      );

      return;
    }

    // Mark user seen.
    await this.chatService.updateChat({
      where: {
        id: markSeenDto.chatId,
      },
      data: {
        seen: {
          connect: [{ id: markSeenDto.user['account']['id'] }],
        },
      },
    });

    // Send confirmation.
    client.send(
      JSON.stringify({
        type: 'success',
        message: ['SEEN'],
      }),
    );
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

    // Send the update message event to the client.
    client.send(
      JSON.stringify({
        type: 'update-message',
        details: {
          chatId: chatModel.id,
          message: messageDto,
        },
      }),
    );
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

    // Send the delete message event to the client too.
    client.send(
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
