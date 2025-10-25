'use client';

import type { Message } from '@/types/chat';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[80%] rounded-lg px-4 py-3
          ${isUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted text-foreground'
          }
        `}
      >
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
        <div className={`text-xs mt-2 ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {new Date(message.createdAt).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
}
