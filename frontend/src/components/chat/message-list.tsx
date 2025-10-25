'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './message-bubble';
import type { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  isLoading: boolean;
}

export function MessageList({ messages, messagesEndRef, isLoading }: MessageListProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center text-muted-foreground py-12">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}
