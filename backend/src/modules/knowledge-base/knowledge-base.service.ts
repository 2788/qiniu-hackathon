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
}
