import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Credentials, Prisma } from '@prisma/client';
import { FirebaseService } from '../firebase/firebase.service';

/**
 * Service Implementation for Credentials Module.
 */
@Injectable()
export class CredentialsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

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
   * Service Implementation for deleting credentials.
   * @param where Query Parameters to delete corresponding Credentials Object.
   * @returns Credentials object.
   */
  public async deleteCredential(
    where: Prisma.CredentialsWhereUniqueInput,
  ): Promise<void> {
    // Fetching credentials record.
    const credentials = await this.getCredential(where);

    // Delete Firebase Account.
    await this.firebaseService.firebaseAuth.deleteUser(where.firebaseId);

    // Executing a transaction deleting the user account as well as credentials.
    await this.prismaService.$transaction([
      this.prismaService.account.delete({
        where: { credentialsId: credentials.id },
      }),
      this.prismaService.credentials.delete({
        where,
      }),
    ]);
  }
}
