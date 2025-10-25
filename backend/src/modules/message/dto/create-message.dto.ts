import { MessageRole } from '../message.entity';

export class CreateMessageDto {
  sessionId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
}
