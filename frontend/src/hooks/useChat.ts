'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getMessages, sendMessageStream, generateSessionTitle } from '@/lib/api';
import type { Message } from '@/types/chat';
import type { Session } from '@/types/session';

interface UseChatProps {
  sessionId: string | null;
  isPendingNewChat: boolean;
  createSession: (model?: string, title?: string) => Promise<{ id: string }>;
  updateSessionInList?: (session: Session) => void;
}

export function useChat({ sessionId, isPendingNewChat, createSession, updateSessionInList }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingMessageRef = useRef(false);

  const loadMessages = useCallback(async () => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    if (isSendingMessageRef.current) {
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
      isSendingMessageRef.current = true;
      setIsLoading(true);
      setError(null);

      let targetSessionId = sessionId;
      let isNewSession = false;
      
      if (isPendingNewChat && !sessionId) {
        const newSession = await createSession();
        targetSessionId = newSession.id;
        isNewSession = true;
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
          isSendingMessageRef.current = false;
        },
        () => {
          setIsLoading(false);
          isSendingMessageRef.current = false;
        }
      );

      if (isNewSession && updateSessionInList) {
        generateSessionTitle(targetSessionId, content.trim())
          .then(updatedSession => {
            updateSessionInList(updatedSession);
          })
          .catch(err => {
            console.error('Failed to generate session title:', err);
          });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setIsLoading(false);
      isSendingMessageRef.current = false;
      throw err;
    }
  }, [sessionId, isPendingNewChat, createSession, updateSessionInList]);

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
