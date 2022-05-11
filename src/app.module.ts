import { AccountModule } from './modules/account/account.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { Logger, Module } from '@nestjs/common';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';

const logger = new Logger('MikroORM');

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env', 'firebase-json.env'],
      isGlobal: true,
    }),
    FirebaseModule,
    PrismaModule,
    AccountModule,
    AuthModule,
  ],
})
export class AppModule {}
