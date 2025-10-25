'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getMessages, sendMessage as sendMessageApi } from '@/lib/api';
import type { Message } from '@/types/chat';

export function useChat(sessionId: string | null) {
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
    if (!sessionId || !content.trim()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await sendMessageApi(sessionId, content.trim());
      setMessages(prev => [...prev, response.userMessage, response.assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

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
