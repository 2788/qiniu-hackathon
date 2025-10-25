import {
  Entity,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { KbReply } from './kb-reply.entity';

@Entity('kb_tickets')
@Index('idx_kb_tickets_category', ['category'])
@Index('idx_kb_tickets_original_id', ['originalId'])
export class KbTicket {
  @Column({ type: 'uuid', primary: true })
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }

  @Column({ name: 'original_id', type: 'integer' })
  originalId: number;

  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => KbReply, (reply) => reply.ticket)
  replies: KbReply[];
}
