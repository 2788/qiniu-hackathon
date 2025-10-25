'use client';

import { useState, KeyboardEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
}

export function MessageInput({ onSendMessage, isLoading }: MessageInputProps) {
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    
    try {
      await onSendMessage(message);
    } catch (error) {
      setInput(message);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="max-w-4xl mx-auto flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          className="min-h-[60px] max-h-[200px] resize-none"
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="self-end"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
