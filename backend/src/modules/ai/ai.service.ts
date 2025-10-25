import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class AiService {
  private openai: OpenAI;
  private readonly logger = new Logger(AiService.name);

  constructor(
    private configService: ConfigService,
    private knowledgeBaseService: KnowledgeBaseService,
  ) {
    const apiKey = this.configService.get<string>('ai.openaiApiKey');
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async generateResponse(
    messages: ChatMessage[],
    model: string = 'gpt-3.5-turbo',
  ): Promise<string> {
    const userQuery = messages[messages.length - 1]?.content || '';

    const relevantTickets =
      await this.knowledgeBaseService.searchRelevantTickets(userQuery, 3);

    const knowledgeContext =
      this.knowledgeBaseService.formatAsContext(relevantTickets);

    this.logger.log(
      `Found ${relevantTickets.length} relevant tickets for query: ${userQuery.substring(0, 50)}...`,
    );

    const enhancedMessages: ChatMessage[] = [];

    if (knowledgeContext) {
      enhancedMessages.push({
        role: 'system',
        content: `你是七牛云的智能客服助手。${knowledgeContext}\n请基于历史案例和你的知识回答用户问题,提供准确、专业的解决方案。`,
      });
    } else {
      enhancedMessages.push({
        role: 'system',
        content: '你是七牛云的智能客服助手,请提供准确、专业的解决方案。',
      });
    }

    enhancedMessages.push(...messages);

    const response = await this.openai.chat.completions.create({
      model,
      messages: enhancedMessages,
    });

    return response.choices[0]?.message?.content || '';
  }
}
