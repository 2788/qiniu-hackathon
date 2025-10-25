'use client';

import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import type { Message } from '@/types/chat';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (content: string) => Promise<void>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  sessionId: string | null;
}

export function ChatArea({ messages, isLoading, onSendMessage, messagesEndRef, sessionId }: ChatAreaProps) {
  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">Welcome to AI Chat</p>
          <p className="text-sm">Create a new conversation to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <MessageList messages={messages} messagesEndRef={messagesEndRef} isLoading={isLoading} />
      <MessageInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
}
