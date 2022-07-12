import { SeedersModule } from './modules/seeders/seeders.module';
import { NotificationModule } from './modules/notification/notification.module';
import { FriendsModule } from './modules/friends/friends.module';
import { CredentialsModule } from './modules/credentials/credentials.module';
import { AccountModule } from './modules/account/account.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { MessageModule } from './modules/message/message.module';

@Module({
  imports:
    process.env.NODE_ENV === 'production'
      ? [
          FirebaseModule,
          PrismaModule,
          CredentialsModule,
          AccountModule,
          AuthModule,
          SeedersModule,
          NotificationModule,
          FriendsModule,
          ChatModule,
          MessageModule,
        ]
      : [
          ConfigModule.forRoot({
            envFilePath: ['.env', 'firebase-json.env'],
            isGlobal: true,
          }),
          FirebaseModule,
          PrismaModule,
          CredentialsModule,
          AccountModule,
          AuthModule,
          SeedersModule,
          NotificationModule,
          FriendsModule,
          ChatModule,
          MessageModule,
        ],
})
export class AppModule {}
