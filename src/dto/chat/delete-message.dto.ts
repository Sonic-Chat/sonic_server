import { ChatError } from './../../enum/error-codes/chat/chat-error.enum';
import { AuthError } from 'src/enum/error-codes/auth/auth-error.enum';
import { Credentials } from '@prisma/client';
import { isUUID } from 'class-validator';

export class DeleteMessageDto {
  public user: Credentials;
  public messageId: string;
}

/**
 * Method to verify DTO Object.
 * @param deleteMessageDto DTO Object for Deleting Message.
 * @returns Error String Array
 */
export const verifyDto = (deleteMessageDto: DeleteMessageDto): string[] => {
  const errors: string[] = [];

  if (!deleteMessageDto.user) {
    errors.push(AuthError.UNAUTHENTICATED);
  }

  if (!isUUID(deleteMessageDto.messageId)) {
    errors.push(ChatError.CHAT_UID_ILLEGAL);
  }

  return errors;
};
