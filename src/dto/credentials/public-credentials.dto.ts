import { Account, Credentials } from '@prisma/client';

export class PublicCredentials {
  public id: string = '';
  public username: string = '';
  public account?: Account = null;

  static toDto(credentials: Credentials): PublicCredentials {
    const publicCredentials = new PublicCredentials();

    publicCredentials.id = credentials.id;
    publicCredentials.username = credentials.username;
    publicCredentials.account = credentials['account']
      ? credentials['account']
      : null;

    return publicCredentials;
  }
}
