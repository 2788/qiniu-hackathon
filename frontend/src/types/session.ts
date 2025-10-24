export interface Session {
  id: string;
  userId: string;
  title: string;
  model: string;
  settings?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt?: Date;
}
