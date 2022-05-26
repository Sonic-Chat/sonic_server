import { ChatError } from './../../enum/error-codes/chat/chat-error.enum';
import { AuthError } from 'src/enum/error-codes/auth/auth-error.enum';
import { Credentials, MessageType } from '@prisma/client';
import { isUUID } from 'class-validator';

export class UpdateMessageDto {
  public user: Credentials;
  public message: string;
  public messageId: string;
}

/**
 * Method to verify DTO Object.
 * @param updateMessageDto DTO Object for Updating Message.
 * @returns Error String Array
 */
export const verifyDto = (updateMessageDto: UpdateMessageDto): string[] => {
  const errors: string[] = [];

  if (!updateMessageDto.user) {
    errors.push(AuthError.UNAUTHENTICATED);
  }

  if (!updateMessageDto.message) {
    errors.push(ChatError.MESSAGE_MISSING);
  }

  if (!isUUID(updateMessageDto.messageId)) {
    errors.push(ChatError.CHAT_UID_ILLEGAL);
  }

  return errors;
};
