# 智能客服系统 - 后端

基于 Nest.js + TypeScript + PostgreSQL 的智能客服系统后端服务。

## 技术栈

- **框架**: Nest.js 11
- **语言**: TypeScript
- **数据库**: PostgreSQL
- **ORM**: TypeORM / Prisma
- **API 风格**: RESTful API

## 目录结构

```
backend/src/
├── modules/
│   ├── session/          # 会话模块
│   │   ├── session.controller.ts
│   │   ├── session.service.ts
│   │   ├── session.module.ts
│   │   ├── entities/
│   │   │   └── session.entity.ts
│   │   └── dto/
│   │       ├── create-session.dto.ts
│   │       └── update-session.dto.ts
│   │
│   ├── message/          # 消息模块
│   │   ├── message.controller.ts
│   │   ├── message.service.ts
│   │   ├── message.module.ts
│   │   ├── entities/
│   │   │   └── message.entity.ts
│   │   └── dto/
│   │       └── create-message.dto.ts
│   │
│   └── ai/               # AI 服务模块
│       ├── ai.service.ts
│       ├── ai.module.ts
│       ├── providers/
│       │   ├── openai.provider.ts
│       │   └── base.provider.ts
│       └── dto/
│           └── ai-request.dto.ts
│
├── common/              # 公共模块
│   ├── filters/        # 异常过滤器
│   ├── interceptors/   # 拦截器
│   └── decorators/     # 装饰器
│       └── user-id.decorator.ts
│
├── config/            # 配置模块
│   ├── database.config.ts
│   └── app.config.ts
│
└── main.ts           # 应用入口
```

## 开发

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

### 数据库设置

确保 PostgreSQL 已安装并运行，然后创建数据库：

```sql
CREATE DATABASE chatbot;
```

运行数据库迁移：

```bash
npm run migration:run
```

### 启动开发服务器

```bash
npm run start:dev
```

服务将运行在 [http://localhost:4000](http://localhost:4000)

### 构建

```bash
npm run build
```

### 启动生产服务器

```bash
npm run start:prod
```

## API 接口

### 会话管理

- `POST /api/sessions` - 创建新会话
- `GET /api/sessions` - 获取会话列表（需要 X-User-Id 请求头）
- `GET /api/sessions/:id` - 获取会话详情
- `PUT /api/sessions/:id` - 更新会话
- `DELETE /api/sessions/:id` - 删除会话

### 消息管理

- `POST /api/messages` - 发送消息
- `GET /api/sessions/:id/messages` - 获取会话消息列表
- `DELETE /api/messages/:id` - 删除消息

## 用户识别

系统通过 `X-User-Id` 请求头识别用户，无需 JWT 认证。用户 ID 由前端 localStorage 生成并存储。

使用 `@UserId()` 装饰器获取当前用户 ID：

```typescript
@Get()
async getSessions(@UserId() userId: string) {
  return this.sessionService.findByUserId(userId);
}
```

## 数据库设计

### sessions 表

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(200),
  model VARCHAR(50) NOT NULL,
  settings JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_message_at TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_updated_at ON sessions(updated_at DESC);
```

### messages 表

```sql
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
```

## 测试

### 单元测试

```bash
npm run test
```

### E2E 测试

```bash
npm run test:e2e
```

### 测试覆盖率

```bash
npm run test:cov
```

## 开发规范

- ESLint + Prettier 代码格式化
- TypeScript 严格模式
- 使用 DTO 进行数据验证
- 遵循 RESTful API 设计规范
- 统一的错误处理和响应格式
