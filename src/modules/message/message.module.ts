import { MessageGateway } from './message.gateway';
import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { ChatModule } from '../chat/chat.module';
import { MessageController } from './message.controller';

@Module({
  imports: [ChatModule],
  providers: [MessageService, MessageGateway],
  controllers: [MessageController],
})
export class MessageModule {}
