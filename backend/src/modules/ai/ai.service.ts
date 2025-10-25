import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('ai.openaiApiKey');
    this.openai = new OpenAI({
      apiKey,
    });
  }

  async generateResponse(
    messages: ChatMessage[],
    model: string = 'gpt-3.5-turbo',
  ): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model,
      messages,
    });

    return response.choices[0]?.message?.content || '';
  }
}
