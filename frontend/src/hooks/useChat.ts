'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getMessages, sendMessageStream } from '@/lib/api';
import type { Message } from '@/types/chat';

interface UseChatProps {
  sessionId: string | null;
  isPendingNewChat: boolean;
  createSession: (model?: string, title?: string) => Promise<{ id: string }>;
}

export function useChat({ sessionId, isPendingNewChat, createSession }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getMessages(sessionId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      let targetSessionId = sessionId;
      
      if (isPendingNewChat && !sessionId) {
        const newSession = await createSession();
        targetSessionId = newSession.id;
      }

      if (!targetSessionId) {
        throw new Error('No session available');
      }

      let streamingMessage: Message | null = null;

      const cleanup = sendMessageStream(
        targetSessionId,
        content.trim(),
        (data) => {
          if (data.type === 'user_message') {
            setMessages(prev => [...prev, data.data]);
          } else if (data.type === 'content') {
            if (!streamingMessage) {
              streamingMessage = {
                id: 'streaming',
                sessionId: targetSessionId!,
                role: 'assistant',
                content: data.data,
                createdAt: new Date().toISOString(),
              };
              setMessages(prev => [...prev, streamingMessage!]);
            } else {
              streamingMessage.content += data.data;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex]?.id === 'streaming') {
                  newMessages[lastIndex] = { ...streamingMessage! };
                }
                return newMessages;
              });
            }
          } else if (data.type === 'done') {
            setMessages(prev => {
              const newMessages = prev.filter(msg => msg.id !== 'streaming');
              return [...newMessages, data.data];
            });
          }
        },
        (error) => {
          setError(error.message);
          setIsLoading(false);
        },
        () => {
          setIsLoading(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setIsLoading(false);
      throw err;
    }
  }, [sessionId, isPendingNewChat, createSession]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    messagesEndRef,
    refreshMessages: loadMessages,
  };
}
