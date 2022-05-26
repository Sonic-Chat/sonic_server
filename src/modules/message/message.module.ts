import { MessageGateway } from './message.gateway';
import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [ChatModule],
  providers: [MessageService, MessageGateway],
})
export class MessageModule {}
