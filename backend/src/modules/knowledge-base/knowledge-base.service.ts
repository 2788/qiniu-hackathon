import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KbTicket } from './entities/kb-ticket.entity';
import { KbReply, KbReplyOwner } from './entities/kb-reply.entity';
import { KbTicketDto } from './dto/import-kb-data.dto';

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);

  constructor(
    @InjectRepository(KbTicket)
    private kbTicketRepository: Repository<KbTicket>,
    @InjectRepository(KbReply)
    private kbReplyRepository: Repository<KbReply>,
  ) {}

  async importData(tickets: KbTicketDto[]): Promise<void> {
    this.logger.log(`Starting import of ${tickets.length} tickets`);

    for (let i = 0; i < tickets.length; i++) {
      const ticketData = tickets[i];

      try {
        const ticket = this.kbTicketRepository.create({
          originalId: ticketData.id,
          title: ticketData.title,
          description: ticketData.description,
          category: ticketData.category,
        });

        const savedTicket = await this.kbTicketRepository.save(ticket);

        const replies = ticketData.replies.map((reply, index) =>
          this.kbReplyRepository.create({
            ticketId: savedTicket.id,
            owner:
              reply.owner === 'customer'
                ? KbReplyOwner.CUSTOMER
                : KbReplyOwner.AGENT,
            content: reply.content,
            sequenceOrder: index,
          }),
        );

        await this.kbReplyRepository.save(replies);

        if ((i + 1) % 100 === 0) {
          this.logger.log(`Imported ${i + 1}/${tickets.length} tickets`);
        }
      } catch (error) {
        this.logger.error(
          `Failed to import ticket ${ticketData.id}: ${error.message}`,
        );
      }
    }

    this.logger.log(`Import completed: ${tickets.length} tickets processed`);
  }

  async searchTickets(
    query: string,
    category?: string,
    limit: number = 10,
  ): Promise<KbTicket[]> {
    const queryBuilder = this.kbTicketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.replies', 'reply')
      .where('ticket.title ILIKE :query OR ticket.description ILIKE :query', {
        query: `%${query}%`,
      });

    if (category) {
      queryBuilder.andWhere('ticket.category = :category', { category });
    }

    return queryBuilder
      .orderBy('ticket.originalId', 'DESC')
      .take(limit)
      .getMany();
  }

  async getTicketWithReplies(ticketId: string): Promise<KbTicket> {
    return this.kbTicketRepository.findOne({
      where: { id: ticketId },
      relations: ['replies'],
      order: {
        replies: {
          sequenceOrder: 'ASC',
        },
      },
    });
  }

  async clearAllData(): Promise<void> {
    this.logger.log('Clearing all knowledge base data');
    await this.kbReplyRepository.delete({});
    await this.kbTicketRepository.delete({});
    this.logger.log('All knowledge base data cleared');
  }

  async searchRelevantTickets(
    query: string,
    limit: number = 3,
  ): Promise<KbTicket[]> {
    const keywords = this.extractKeywords(query);

    if (keywords.length === 0) {
      return [];
    }

    const tickets = await this.kbTicketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.replies', 'reply')
      .where(
        'ticket.title ILIKE ANY(ARRAY[:...keywords]) OR ticket.description ILIKE ANY(ARRAY[:...keywords])',
        {
          keywords: keywords.map((k) => `%${k}%`),
        },
      )
      .orderBy('reply.sequenceOrder', 'ASC')
      .take(limit)
      .getMany();

    return tickets;
  }

  private extractKeywords(text: string): string[] {
    if (!text) return [];

    return text
      .split(/[\s,。!?、:;，！？：；]+/)
      .filter((word) => word.length >= 2)
      .slice(0, 10);
  }

  formatAsContext(tickets: KbTicket[]): string {
    if (tickets.length === 0) return '';

    let context = '以下是相关的历史客服案例供参考:\n\n';

    tickets.forEach((ticket, idx) => {
      context += `【案例${idx + 1}】\n`;
      context += `分类: ${ticket.category || '未分类'}\n`;
      context += `问题: ${ticket.title}\n`;

      if (ticket.description) {
        context += `描述: ${this.stripHtml(ticket.description)}\n`;
      }

      if (ticket.replies && ticket.replies.length > 0) {
        context += `对话记录:\n`;

        ticket.replies.forEach((reply) => {
          const speaker = reply.owner === KbReplyOwner.CUSTOMER ? '用户' : '客服';
          const content = this.stripHtml(reply.content);
          context += `${speaker}: ${content}\n`;
        });
      }

      context += '\n';
    });

    return context;
  }

  private stripHtml(html: string): string {
    if (!html) return '';

    return html
      .replace(/<img[^>]*>/gi, '[图片]')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  }
}
