import { getUserId } from './user-id';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function sendMessage(sessionId: string, content: string) {
  const userId = getUserId();
  
  const response = await fetch(`${API_BASE_URL}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
    body: JSON.stringify({
      sessionId,
      content,
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to send message');
  }
  
  return response.json();
}

export async function getSessions() {
  const userId = getUserId();
  
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    headers: {
      'X-User-Id': userId,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to get sessions');
  }
  
  return response.json();
}

export async function createSession() {
  const userId = getUserId();
  
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId,
    },
    body: JSON.stringify({}),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create session');
  }
  
  return response.json();
}
