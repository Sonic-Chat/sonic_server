import { AuthError } from './../../enum/error-codes/auth/auth-error.enum';
import { Credentials } from '@prisma/client';

export class ConnectServerDto {
  public user: Credentials;
}

/**
 * Method to verify DTO Object.
 * @param connectServerDto DTO Object for Connecting to Server.
 * @returns Error String Array
 */
export const verifyDto = (connectServerDto: ConnectServerDto): string[] => {
  const errors: string[] = [];

  if (!connectServerDto.user) {
    errors.push(AuthError.UNAUTHENTICATED);
  }

  return errors;
};
