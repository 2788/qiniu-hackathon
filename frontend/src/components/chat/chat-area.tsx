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
  isPendingNewChat: boolean;
}

export function ChatArea({ messages, isLoading, onSendMessage, messagesEndRef, sessionId, isPendingNewChat }: ChatAreaProps) {
  if (!sessionId && !isPendingNewChat) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg mb-2">Welcome to AI Chat</p>
          <p className="text-sm">Click "New Chat" to start a conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {isPendingNewChat && messages.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg mb-2">Ready to chat</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        </div>
      ) : (
        <MessageList messages={messages} messagesEndRef={messagesEndRef} isLoading={isLoading} />
      )}
      <MessageInput onSendMessage={onSendMessage} isLoading={isLoading} />
    </div>
  );
}
