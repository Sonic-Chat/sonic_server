import { Dummy } from './models/dummy.model';
import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      dbName: process.env.DATABASE_NAME,
      name: 'sonic-database',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      type: 'postgresql',
      entities: [Dummy],
    }),
  ],
})
export class AppModule {}
