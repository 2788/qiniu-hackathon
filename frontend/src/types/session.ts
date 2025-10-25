export interface Session {
  id: string;
  userId: string;
  title: string | null;
  model: string;
  settings?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string | null;
}

export interface SessionListItem extends Session {
  lastMessage?: string;
}
