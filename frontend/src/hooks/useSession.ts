'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSessions, createSession as createSessionApi, deleteSession as deleteSessionApi, type CreateSessionDto } from '@/lib/api';
import type { Session } from '@/types/session';

export function useSession() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isPendingNewChat, setIsPendingNewChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSessions();
      setSessions(data);
      
      if (data.length > 0 && !currentSessionId && !isPendingNewChat) {
        setCurrentSessionId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, isPendingNewChat]);

  const createSession = useCallback(async (model: string = 'gpt-3.5-turbo', title?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data: CreateSessionDto = {
        model,
        title: title || `New Chat ${new Date().toLocaleString()}`,
      };
      const newSession = await createSessionApi(data);
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setIsPendingNewChat(false);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setIsPendingNewChat(true);
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteSessionApi(sessionId);
      setSessions(prev => {
        const filtered = prev.filter(s => s.id !== sessionId);
        if (currentSessionId === sessionId && filtered.length > 0) {
          setCurrentSessionId(filtered[0].id);
          setIsPendingNewChat(false);
        } else if (filtered.length === 0) {
          setCurrentSessionId(null);
          setIsPendingNewChat(false);
        }
        return filtered;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId]);

  const selectSession = useCallback((sessionId: string) => {
    setCurrentSessionId(sessionId);
    setIsPendingNewChat(false);
  }, []);

  const currentSession = sessions.find(s => s.id === currentSessionId) || null;

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions,
    currentSession,
    currentSessionId,
    isPendingNewChat,
    isLoading,
    error,
    createSession,
    startNewChat,
    deleteSession,
    selectSession,
    refreshSessions: loadSessions,
  };
}
