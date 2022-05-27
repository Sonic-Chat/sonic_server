import { Injectable } from '@nestjs/common';
import { Credentials, Prisma, Token } from '@prisma/client';
import { SaveTokenDto } from 'src/dto/token/save-token.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prismaService: PrismaService) {
    this.prismaService.$on<any>('query', (event: Prisma.QueryEvent) => {
      console.log('Query: ' + event.query);
      console.log('Duration: ' + event.duration + 'ms');
    });
  }

  public async getToken(
    args: Prisma.TokenFindUniqueArgs,
  ): Promise<Token | null> {
    return await this.prismaService.token.findUnique(args);
  }

  public async createToken(args: Prisma.TokenCreateArgs): Promise<Token> {
    return await this.prismaService.token.create(args);
  }

  public async updateToken(args: Prisma.TokenUpdateArgs): Promise<Token> {
    return await this.prismaService.token.update(args);
  }

  public async saveToken(
    user: Credentials,
    saveTokenDto: SaveTokenDto,
  ): Promise<Token> {
    const checkToken = await this.getToken({
      where: {
        credentialsId: user.id,
      },
    });

    if (checkToken) {
      return await this.updateToken({
        where: {
          id: checkToken.id,
        },
        data: {
          token: saveTokenDto.token,
        },
      });
    } else {
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
}
