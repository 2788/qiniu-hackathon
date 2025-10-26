import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Sse,
  MessageEvent,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { MessageService } from './message.service';
import { UserId } from '../../common/decorators/user-id.decorator';

export class SendMessageDto {
  sessionId: string;
  content: string;
}

@Controller('api/messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @UserId() userId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messageService.sendMessage(
      sendMessageDto.sessionId,
      userId,
      sendMessageDto.content,
    );
  }

  @Sse('stream')
  sendMessageStream(
    @Query('userId') userId: string,
    @Query('sessionId') sessionId: string,
    @Query('content') content: string,
  ): Observable<MessageEvent> {
    return new Observable<MessageEvent>((observer) => {
      (async () => {
        try {
          for await (const event of this.messageService.sendMessageStream(
            sessionId,
            userId,
            content,
          )) {
            observer.next({
              data: event,
            });
          }
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      })();
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.messageService.remove(id);
  }
}

@Controller('api/sessions/:sessionId/messages')
export class SessionMessagesController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  findAll(@Param('sessionId') sessionId: string) {
    return this.messageService.findBySession(sessionId);
  }
}
