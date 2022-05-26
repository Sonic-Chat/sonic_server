import { MessageGateway } from './message.gateway';
import { Module } from '@nestjs/common';
import { MessageService } from './message.service';

@Module({
  providers: [MessageService, MessageGateway],
})
export class MessageModule {}
