'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSessions, createSession as createSessionApi, deleteSession as deleteSessionApi, type CreateSessionDto } from '@/lib/api';
import type { Session } from '@/types/session';
import { defaultModel } from '@/constants/chat';

export function useSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isPendingNewChat, setIsPendingNewChat] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSessions();
      setSessions(data);
      
      if (!isInitialized) {
        const sessionIdFromUrl = searchParams.get('session');
        if (sessionIdFromUrl && data.some(s => s.id === sessionIdFromUrl)) {
          setCurrentSessionId(sessionIdFromUrl);
          setIsPendingNewChat(false);
        } else if (data.length > 0 && !isPendingNewChat) {
          setCurrentSessionId(data[0].id);
          setIsPendingNewChat(false);
        }
        setIsInitialized(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, isInitialized, isPendingNewChat]);

  const createSession = useCallback(async (model: string = defaultModel, title?: string) => {
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
      router.push(`?session=${newSession.id}`);
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const startNewChat = useCallback(() => {
    setCurrentSessionId(null);
    setIsPendingNewChat(true);
    router.push('/');
  }, [router]);

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
    router.push(`?session=${sessionId}`);
  }, [router]);

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
