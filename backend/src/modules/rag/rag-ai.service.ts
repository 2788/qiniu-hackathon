import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { RagService } from './rag.service';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class RagAiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private ragService: RagService,
  ) {
    const apiKey = this.configService.get<string>('ai.openaiApiKey');
    this.openai = new OpenAI({
      baseURL: 'https://openai.qiniu.com/v1',
      apiKey,
    });
  }

  async generateResponse(
    messages: ChatMessage[],
    model: string,
  ): Promise<string> {
    const userQuery = messages[messages.length - 1]?.content || '';

    const relevantDocs = await this.ragService.searchRelevant(userQuery, 3);
    const knowledgeContext = this.ragService.formatAsContext(relevantDocs);

    const enhancedMessages: ChatMessage[] = [];

    if (knowledgeContext) {
      enhancedMessages.push({
        role: 'system',
        content: `你是七牛云的智能客服助手。${knowledgeContext}\n请基于历史案例和你的知识回答用户问题。`,
      });
    } else {
      enhancedMessages.push({
        role: 'system',
        content: '你是七牛云的智能客服助手。',
      });
    }

    enhancedMessages.push(...messages);

    const response = await this.openai.chat.completions.create({
      model,
      messages: enhancedMessages,
    });

    return response.choices[0]?.message?.content || '';
  }

  async *generateResponseStream(
    messages: ChatMessage[],
    model: string,
  ): AsyncGenerator<string, void, unknown> {
    const userQuery = messages[messages.length - 1]?.content || '';

    const relevantDocs = await this.ragService.searchRelevant(userQuery, 3);
    const knowledgeContext = this.ragService.formatAsContext(relevantDocs);

    const enhancedMessages: ChatMessage[] = [];

    if (knowledgeContext) {
      enhancedMessages.push({
        role: 'system',
        content: `你是七牛云的智能客服助手。${knowledgeContext}\n请基于历史案例和你的知识回答用户问题。`,
      });
    } else {
      enhancedMessages.push({
        role: 'system',
        content: '你是七牛云的智能客服助手。',
      });
    }

    enhancedMessages.push(...messages);

    const stream = await this.openai.chat.completions.create({
      model,
      messages: enhancedMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}
