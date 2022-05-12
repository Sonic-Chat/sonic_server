import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';

/**
 * Service Implementation for Account Module.
 */
@Injectable()
export class AccountService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Service implementation for fetching a user.
   * @param where Query parameters to fetch a user.
   * @returns Account object or null.
   */
  public async getUser(
    where: Prisma.AccountWhereUniqueInput,
  ): Promise<Account | null> {
    // Pass the query parameters to find a unique account and return it.
    return await this.prismaService.account.findUnique({
      where,
    });
  }
}
