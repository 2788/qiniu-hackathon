import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageRole } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { AiService } from '../ai/ai.service';
import { SessionService } from '../session/session.service';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private aiService: AiService,
    private sessionService: SessionService,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create(createMessageDto);
    return this.messageRepository.save(message);
  }

  async findBySession(sessionId: string): Promise<Message[]> {
    return this.messageRepository.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }

  async remove(id: string): Promise<void> {
    const message = await this.messageRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }
    await this.messageRepository.remove(message);
  }

  async sendMessage(
    sessionId: string,
    userId: string,
    content: string,
  ): Promise<{ userMessage: Message; assistantMessage: Message }> {
    const session = await this.sessionService.findOne(sessionId, userId);

    const userMessage = await this.create({
      sessionId,
      role: MessageRole.USER,
      content,
    });

    const messageHistory = await this.findBySession(sessionId);
    const chatMessages = messageHistory.map((msg) => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    const aiResponse = await this.aiService.generateResponse(
      chatMessages,
      session.model,
    );

    const assistantMessage = await this.create({
      sessionId,
      role: MessageRole.ASSISTANT,
      content: aiResponse,
    });

    await this.sessionService.updateLastMessageAt(sessionId);

    return { userMessage, assistantMessage };
  }
}
