import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Credentials, Prisma } from '@prisma/client';

@Injectable()
export class CredentialsService {
  constructor(private readonly prismaService: PrismaService) {}

  public async getCredential(
    credentialsWhereUniqueInput: Prisma.CredentialsWhereUniqueInput,
  ): Promise<Credentials | null> {
    return await this.prismaService.credentials.findUnique({
      where: credentialsWhereUniqueInput,
    });
  }

  public async createCredential(
    data: Prisma.CredentialsCreateInput,
  ): Promise<Credentials> {
    return await this.prismaService.credentials.create({ data });
  }

  public async deleteCredential(
    where: Prisma.CredentialsWhereUniqueInput,
  ): Promise<Credentials> {
    return await this.prismaService.credentials.delete({ where });
  }
}
