import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Credentials, Prisma } from '@prisma/client';

/**
 * Service Implementation for Credentials Module.
 */
@Injectable()
export class CredentialsService {
  constructor(private readonly prismaService: PrismaService) {}

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
  ): Promise<Credentials> {
    // Pass the parameters and return the result.
    return await this.prismaService.credentials.delete({
      where,
      include: {
        account: true,
      },
    });
  }
}
