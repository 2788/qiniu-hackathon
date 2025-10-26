import { getUserId } from './user-id';
import type { Session } from '@/types/session';
import type { Message } from '@/types/chat';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface CreateSessionDto {
  title?: string;
  model: string;
  settings?: Record<string, unknown>;
}

export interface UpdateSessionDto {
  title?: string;
  model?: string;
  settings?: Record<string, unknown>;
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const userId = getUserId();
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed: ${response.status}`);
  }
  
  return response.json();
}

export async function createSession(data: CreateSessionDto): Promise<Session> {
  return fetchWithAuth('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getSessions(): Promise<Session[]> {
  return fetchWithAuth('/api/sessions');
}

export async function getSession(id: string): Promise<Session> {
  return fetchWithAuth(`/api/sessions/${id}`);
}

export async function updateSession(id: string, data: UpdateSessionDto): Promise<Session> {
  return fetchWithAuth(`/api/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSession(id: string): Promise<void> {
  await fetchWithAuth(`/api/sessions/${id}`, {
    method: 'DELETE',
  });
}

export async function sendMessage(sessionId: string, content: string): Promise<SendMessageResponse> {
  return fetchWithAuth('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ sessionId, content }),
  });
}

export function sendMessageStream(
  sessionId: string,
  content: string,
  onMessage: (data: { type: string; data: any }) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void,
): () => void {
  const userId = getUserId();
  const params = new URLSearchParams({
    sessionId,
    content,
    userId,
  });
  
  const eventSource = new EventSource(
    `${API_BASE_URL}/api/messages/stream?${params}`
  );

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
      
      if (data.type === 'done') {
        eventSource.close();
        onComplete?.();
      }
    } catch (error) {
      console.error('Failed to parse SSE data:', error);
    }
  };

  eventSource.onerror = (error) => {
    eventSource.close();
    onError?.(new Error('SSE connection error'));
  };

  return () => {
    eventSource.close();
  };
}

export async function getMessages(sessionId: string): Promise<Message[]> {
  return fetchWithAuth(`/api/sessions/${sessionId}/messages`);
}

export async function deleteMessage(id: string): Promise<void> {
  await fetchWithAuth(`/api/messages/${id}`, {
    method: 'DELETE',
  });
}
