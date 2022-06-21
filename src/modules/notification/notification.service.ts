import { Injectable } from '@nestjs/common';
import { Account, Credentials, Prisma, Token } from '@prisma/client';
import { SaveTokenDto } from 'src/dto/token/save-token.dto';
import { FirebaseService } from '../firebase/firebase.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {
    this.prismaService.$on<any>('query', (event: Prisma.QueryEvent) => {
      console.log('Query: ' + event.query);
      console.log('Duration: ' + event.duration + 'ms');
    });
  }

  /**
   * Service Implementation to fetch token.
   * @param args Token Find Unique Args
   * @returns Token Object
   */
  public async getToken(
    args: Prisma.TokenFindUniqueArgs,
  ): Promise<Token | null> {
    return await this.prismaService.token.findUnique(args);
  }

  /**
   * Service Implementation to create token.
   * @param args Token Create Args
   * @returns Token Object
   */
  public async createToken(args: Prisma.TokenCreateArgs): Promise<Token> {
    return await this.prismaService.token.create(args);
  }
  /**
   * Service Implementation to update token.
   * @param args Token Update Args
   * @returns Token Object
   */
  public async updateToken(args: Prisma.TokenUpdateArgs): Promise<Token> {
    return await this.prismaService.token.update(args);
  }

  /**
   * Service Implementation for saving FCM Token.
   * @param user Logged In User Details.
   * @param saveTokenDto DTO Object fdr saving token to database.
   * @returns Created/Updated Token.
   */
  public async saveToken(
    user: Credentials,
    saveTokenDto: SaveTokenDto,
  ): Promise<Token> {
    // Check for existence of token.
    const checkToken = await this.getToken({
      where: {
        credentialsId: user.id,
      },
    });

    if (checkToken) {
      // Update token if it exists.
      return await this.updateToken({
        where: {
          id: checkToken.id,
        },
        data: {
          token: saveTokenDto.token,
        },
      });
    } else {
      // Create new token object.
      return await this.createToken({
        data: {
          token: saveTokenDto.token,
          credentials: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    }
  }

  /**
   * Service Implementation for saving FCM Token.
   * @param user Logged In User Details.
   * @param data Data to be sent.
   */
  public async sendNotification(user: Account, data: any): Promise<void> {
    // Check for existence of token.
    const checkToken = await this.getToken({
      where: {
        credentialsId: user.credentialsId,
      },
    });

    if (checkToken) {
      // Send notification if token exists.
      await this.firebaseService.firebaseMessaging.sendToDevice(
        checkToken.token,
        {
          data,
        },
        {
          contentAvailable: true,
          priority: 'high',
        },
      );
    }
  }
}
