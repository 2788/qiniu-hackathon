import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Message } from '../message/message.entity';

@Entity('sessions')
@Index('idx_sessions_user_id', ['userId'])
@Index('idx_sessions_updated_at', ['updatedAt'])
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 50 })
  model: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_message_at', type: 'timestamp', nullable: true })
  lastMessageAt: Date;

  @OneToMany(() => Message, (message) => message.session)
  messages: Message[];
}
