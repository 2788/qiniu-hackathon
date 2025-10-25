import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
