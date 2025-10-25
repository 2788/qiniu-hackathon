import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MessageController,
  SessionMessagesController,
} from './message.controller';
import { MessageService } from './message.service';
import { Message } from './message.entity';
import { AiModule } from '../ai/ai.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), AiModule, SessionModule],
  controllers: [MessageController, SessionMessagesController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
