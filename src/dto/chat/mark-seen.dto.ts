import { ChatError } from './../../enum/error-codes/chat/chat-error.enum';
import { AuthError } from 'src/enum/error-codes/auth/auth-error.enum';
import { Credentials } from '@prisma/client';
import { isUUID } from 'class-validator';

export class MarkSeenDto {
  public user: Credentials;
  public chatId: string;
}

/**
 * Method to verify DTO Object.
 * @param markSeenDto DTO Implementation for marking a chat seen.
 * @returns Error String Array
 */
export const verifyDto = (markSeenDto: MarkSeenDto): string[] => {
  const errors: string[] = [];

  if (!markSeenDto.user) {
    errors.push(AuthError.UNAUTHENTICATED);
  }

  if (!isUUID(markSeenDto.chatId)) {
    errors.push(ChatError.CHAT_UID_ILLEGAL);
  }

  return errors;
};
