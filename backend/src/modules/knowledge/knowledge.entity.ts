import {
  Entity,
  Column,
  CreateDateColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';

@Entity('knowledge_base')
@Index('idx_kb_ticket_id', ['ticketId'])
@Index('idx_kb_category', ['category'])
export class KnowledgeBase {
  @Column({ type: 'uuid', primary: true })
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }

  @Column({ name: 'ticket_id', type: 'integer' })
  ticketId: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'jsonb' })
  conversation: Array<{ role: string; content: string }>;

  @Column({ type: 'text', array: true })
  keywords: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
