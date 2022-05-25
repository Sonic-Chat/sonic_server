import { ChatModule } from './../chat/chat.module';
import { Module } from '@nestjs/common';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';

@Module({
  imports: [ChatModule],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
