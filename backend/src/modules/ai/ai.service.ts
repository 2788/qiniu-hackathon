import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { KnowledgeService } from '../knowledge/knowledge.service';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private configService: ConfigService,
    private knowledgeService: KnowledgeService,
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

    const relevantTickets = await this.knowledgeService.searchRelevant(
      userQuery,
      3,
    );
    const knowledgeContext =
      this.knowledgeService.formatAsContext(relevantTickets);

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

    const relevantTickets = await this.knowledgeService.searchRelevant(
      userQuery,
      3,
    );
    const knowledgeContext =
      this.knowledgeService.formatAsContext(relevantTickets);

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

  async generateTitle(firstMessage: string, model: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的标题生成助手。请根据用户的第一条消息,生成一个简短、准确的会话标题。标题应该:1)不超过20个字;2)准确概括对话主题;3)直接返回标题文本,不要添加引号或其他符号。',
      },
      {
        role: 'user',
        content: `请为以下对话生成一个简短的标题:\n\n${firstMessage}`,
      },
    ];

    const response = await this.openai.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 50,
    });

    const title = response.choices[0]?.message?.content?.trim() || '';
    return title.replace(/^["']|["']$/g, '');
  }
}
