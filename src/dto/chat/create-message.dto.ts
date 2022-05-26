import { ChatError } from './../../enum/error-codes/chat/chat-error.enum';
import { AuthError } from 'src/enum/error-codes/auth/auth-error.enum';
import { Credentials, MessageType } from '@prisma/client';
import { isUUID } from 'class-validator';

export class CreateMessageDto {
  public user: Credentials;
  public type: string;
  public message?: string;
  public imageUrl?: string;
  public firebaseId?: string;
  public chatId: string;
}

/**
 * Method to verify DTO Object.
 * @param createMessageDto DTO Object for Creating Message.
 * @returns Error String Array
 */
export const verifyDto = (createMessageDto: CreateMessageDto): string[] => {
  const errors: string[] = [];

  if (!createMessageDto.user) {
    errors.push(AuthError.UNAUTHENTICATED);
  }

  if (
    !Object.values(MessageType).find((type) => type === createMessageDto.type)
  ) {
    errors.push(ChatError.ILLEGAL_ACTION);
  }

  if (createMessageDto.type.includes('TEXT') && !createMessageDto.message) {
    errors.push(ChatError.MESSAGE_MISSING);
  }

  if (
    createMessageDto.type.includes('IMAGE') &&
    !createMessageDto.imageUrl &&
    !createMessageDto.firebaseId
  ) {
    errors.push(ChatError.IMAGE_MISSING);
  }

  if (!isUUID(createMessageDto.chatId)) {
    errors.push(ChatError.CHAT_UID_ILLEGAL);
  }

  return errors;
};
