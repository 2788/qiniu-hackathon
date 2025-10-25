import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KnowledgeBase } from './knowledge.entity';

@Injectable()
export class KnowledgeService {
  constructor(
    @InjectRepository(KnowledgeBase)
    private knowledgeRepo: Repository<KnowledgeBase>,
  ) {}

  async searchRelevant(
    query: string,
    limit: number = 3,
  ): Promise<KnowledgeBase[]> {
    const keywords = this.extractKeywords(query);

    if (keywords.length === 0) {
      return [];
    }

    const qb = this.knowledgeRepo
      .createQueryBuilder('kb')
      .where('kb.keywords && :keywords', { keywords })
      .orderBy(
        '(SELECT COUNT(*) FROM unnest(kb.keywords) k WHERE k = ANY(:keywords))',
        'DESC',
      )
      .limit(limit);

    return qb.getMany();
  }

  private extractKeywords(text: string): string[] {
    return text
      .split(/[\s,。!?、]+/)
      .filter((word) => word.length >= 2)
      .slice(0, 10);
  }

  formatAsContext(tickets: KnowledgeBase[]): string {
    if (tickets.length === 0) return '';

    let context = '以下是相关的历史客服案例供参考:\n\n';

    tickets.forEach((ticket, idx) => {
      context += `【案例${idx + 1}】\n`;
      context += `分类: ${ticket.category}\n`;
      context += `问题: ${ticket.title}\n`;
      context += `对话记录:\n`;

      ticket.conversation.forEach((msg) => {
        const speaker = msg.role === 'user' ? '用户' : '客服';
        context += `${speaker}: ${msg.content}\n`;
      });

      context += '\n';
    });

    return context;
  }
}
