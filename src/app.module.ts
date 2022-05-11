import { PrismaModule } from './modules/prisma/prisma.module';
import { Logger, Module } from '@nestjs/common';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { DummyModule } from './modules/dummy/dummy.module';
import { ConfigModule } from '@nestjs/config';

const logger = new Logger('MikroORM');

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', 'firebase-json.env'],
      isGlobal: true,
    }),
    FirebaseModule,
    PrismaModule,
    DummyModule,
  ],
})
export class AppModule {}
