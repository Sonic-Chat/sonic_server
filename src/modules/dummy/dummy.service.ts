import { PrismaService } from './../prisma/prisma.service';
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class DummyService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const dummies = await this.prisma.dummylol.findMany();

    console.log(dummies);
  }
}
