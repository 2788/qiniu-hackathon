import {
  Entity,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { KbTicket } from './kb-ticket.entity';

export enum KbReplyOwner {
  CUSTOMER = 'customer',
  AGENT = 'agent',
}

@Entity('kb_replies')
@Index('idx_kb_replies_ticket_id', ['ticketId'])
@Index('idx_kb_replies_owner', ['owner'])
export class KbReply {
  @Column({ type: 'uuid', primary: true })
  id: string;

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = randomUUID();
    }
  }

  @Column({ name: 'ticket_id', type: 'uuid' })
  ticketId: string;

  @Column({
    type: 'varchar',
    length: 20,
    enum: KbReplyOwner,
  })
  owner: KbReplyOwner;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'sequence_order', type: 'integer' })
  sequenceOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => KbTicket, (ticket) => ticket.replies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ticket_id' })
  ticket: KbTicket;
}
