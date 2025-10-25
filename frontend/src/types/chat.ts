export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  sessionId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error?: string | null;
}
