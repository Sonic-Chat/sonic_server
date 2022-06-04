import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Account, Credentials, Prisma } from '@prisma/client';
import { FirebaseService } from '../firebase/firebase.service';

/**
 * Service Implementation for Credentials Module.
 */
@Injectable()
export class CredentialsService {
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
   * Service Implementation for fetching credentials.
   * @param where Query Parameters to fetch corresponding Credentials Object.
   * @returns Credentials object or null.
   */
  public async getCredential(
    where: Prisma.CredentialsWhereUniqueInput,
  ): Promise<Credentials | null> {
    // Pass the parameters and return the result.
    return await this.prismaService.credentials.findUnique({
      where,
      include: {
        account: true,
      },
    });
  }

  /**
   * Service Implementation for creation of credentials.
   * @param data Parameters to create Credentials object.
   * @returns Credentials Object.
   */
  public async createCredential(
    data: Prisma.CredentialsCreateInput,
  ): Promise<Credentials> {
    // Pass the parameters and return the result.
    return await this.prismaService.credentials.create({ data });
  }

  /**
   * Service Implementation for deleting credentials and all user generated content.
   * @param where Query Parameters to delete corresponding Credentials Object.
   * @returns Credentials object.
   */
  public async deleteCredential(
    where: Prisma.CredentialsWhereUniqueInput,
  ): Promise<void> {
    // Fetching credentials record.
    const credentials = await this.getCredential(where);

    // Fetching account record.
    const account = await this.prismaService.account.findUnique({
      where: {
        credentialsId: credentials.id,
      },
    });

    // Build deletion transaction array.
    const transactions = await this.buildTransaction(account, credentials);

    // Executing a transaction deleting the all user generated content.
    await this.prismaService.$transaction([
      ...transactions,
      this.prismaService.account.delete({
        where: {
          credentialsId: credentials.id,
        },
      }),
      this.prismaService.credentials.delete({
        where: {
          id: credentials.id,
        },
      }),
    ]);

    // Delete Firebase Account.
    await this.firebaseService.firebaseAuth.deleteUser(where.firebaseId);
  }

  /**
   * Service Implementation for building deletion transaction array.
   * @param account Account Model.
   * @param credentials Credentials Model.
   * @returns Transactions Array.
   */
  private async buildTransaction(
    account: Account,
    credentials: Credentials,
  ): Promise<any[]> {
    const transactionArray = [];
    // Check for message record existence.
    if (
      (
        await this.prismaService.message.findMany({
          where: { sentBy: { id: account.id } },
        })
      ).length > 0
    ) {
      transactionArray.push(
        this.prismaService.message.deleteMany({
          where: {
            sentBy: {
              id: account.id,
            },
          },
        }),
      );
    }
    // Check for chat record existence.
    if (
      (
        await this.prismaService.chat.findMany({
          where: {
            participants: {
              some: {
                id: account.id,
              },
            },
          },
        })
      ).length > 0
    ) {
      transactionArray.push(
        this.prismaService.chat.deleteMany({
          where: {
            participants: {
              some: {
                id: account.id,
              },
            },
          },
        }),
      );
    }
    // Check for friend record existence.
    if (
      (
        await this.prismaService.friends.findMany({
          where: {
            accounts: {
              some: {
                id: account.id,
              },
            },
          },
        })
      ).length > 0
    ) {
      transactionArray.push(
        this.prismaService.friends.deleteMany({
          where: {
            accounts: {
              some: {
                id: account.id,
              },
            },
          },
        }),
      );
    }
    // Check for token record existence.
    if (
      await this.prismaService.token.findUnique({
        where: {
          credentialsId: credentials.id,
        },
      })
    ) {
      transactionArray.push(
        this.prismaService.token.delete({
          where: {
            credentialsId: credentials.id,
          },
        }),
      );
    }

    // Return transaction array.
    return transactionArray;
  }
}
