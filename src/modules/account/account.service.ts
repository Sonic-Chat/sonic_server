import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Account, Prisma } from '@prisma/client';

@Injectable()
export class AccountService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getUser(
    accountWhereUniqueInput: Prisma.AccountWhereUniqueInput,
  ): Promise<Account | null> {
    return await this.prismaService.account.findUnique({
      where: accountWhereUniqueInput,
    });
  }
}
