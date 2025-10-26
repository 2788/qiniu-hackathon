-- 会话表
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(36) NOT NULL,  -- 来自前端 localStorage 的 UUID
  title VARCHAR(200),
  model VARCHAR(50) NOT NULL,
  settings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_updated_at ON sessions(updated_at DESC);

-- 消息表
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_session_id ON messages(session_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- 创建知识库表
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  conversation JSONB NOT NULL,
  keywords TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kb_ticket_id ON knowledge_base(ticket_id);
CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_kb_keywords ON knowledge_base USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_kb_title ON knowledge_base USING GIN(to_tsvector('simple', title));

COMMENT ON TABLE knowledge_base IS '客服知识库表';
COMMENT ON COLUMN knowledge_base.ticket_id IS '原始工单ID';
COMMENT ON COLUMN knowledge_base.title IS '问题标题';
COMMENT ON COLUMN knowledge_base.description IS '问题描述';
COMMENT ON COLUMN knowledge_base.category IS '问题分类';
COMMENT ON COLUMN knowledge_base.conversation IS '完整对话记录(JSONB格式)';
COMMENT ON COLUMN knowledge_base.keywords IS '关键词数组(用于检索)';
