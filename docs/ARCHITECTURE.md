# 智能客服系统架构设计文档

## 1. 系统概述

### 1.1 项目介绍
智能客服系统是一个基于 AI 的对话式客服平台，提供流畅的人机交互体验，支持多模型切换、会话管理和个性化配置等功能。

### 1.2 技术栈

#### 后端技术栈
- **运行时**: Node.js
- **框架**: Nest.js
- **语言**: TypeScript
- **API 风格**: RESTful API
- **数据库**: PostgreSQL

#### 前端技术栈
- **框架**: React
- **应用框架**: Next.js (App Router)
- **语言**: TypeScript
- **UI 组件库**: shadcn/ui
- **样式**: Tailwind CSS

### 1.3 目录结构
```
qiniu-hackathon/
├── backend/              # 后端服务目录
│   ├── src/
│   │   ├── modules/     # 功能模块
│   │   ├── common/      # 公共模块
│   │   ├── config/      # 配置文件
│   │   └── main.ts      # 应用入口
│   ├── test/            # 测试文件
│   └── package.json
│
├── frontend/            # 前端应用目录
│   ├── src/
│   │   ├── app/        # Next.js App Router
│   │   ├── components/ # React 组件
│   │   ├── lib/        # 工具库
│   │   ├── hooks/      # 自定义 Hooks
│   │   └── types/      # TypeScript 类型定义
│   ├── public/         # 静态资源
│   └── package.json
│
└── docs/               # 文档目录
```

## 2. 系统架构

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户界面层                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 顶部导航  │  │ 会话列表  │  │ 对话区域  │  │ 配置面板  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP
┌─────────────────────────────────────────────────────────────┐
│                        前端应用层                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   React 组件      │  │   状态管理        │                │
│  │  - shadcn/ui     │  │  - Context API   │                │
│  │  - 业务组件       │  │  - Local State   │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   API Client     │  │   localStorage   │                │
│  │  - fetch API     │  │  - 用户标识       │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            ↕ RESTful API
┌─────────────────────────────────────────────────────────────┐
│                        后端服务层                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ 会话模块  │  │ 消息模块  │  │ AI模块   │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                        数据持久层                             │
│  ┌──────────────────┐                                       │
│  │   PostgreSQL     │                                       │
│  │  - 会话记录       │                                       │
│  │  - 消息历史       │                                       │
│  │  - 用户设置       │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                        外部服务层                             │
│  ┌──────────────────┐                                       │
│  │   AI API 服务     │                                       │
│  │  - OpenAI        │                                       │
│  │  - 其他AI模型     │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术架构分层

#### 2.2.1 前端架构
- **视图层**: React 组件 + shadcn/ui + Tailwind CSS
- **逻辑层**: Custom Hooks + 业务逻辑
- **数据层**: Context API + Local State
- **通信层**: fetch API (标准 HTTP 请求)
- **本地存储**: localStorage (用户标识)

#### 2.2.2 后端架构
- **控制层**: Controllers (处理 HTTP 请求)
- **服务层**: Services (业务逻辑)
- **数据访问层**: TypeORM / Prisma (数据库操作)

## 3. 前端架构设计

### 3.1 应用结构

```
frontend/src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   └── globals.css        # 全局样式
│
├── components/            # React 组件
│   ├── layout/           # 布局组件
│   │   ├── Header.tsx    # 顶部导航栏
│   │   ├── Sidebar.tsx   # 左侧会话列表
│   │   └── ConfigPanel.tsx # 右侧配置面板
│   │
│   ├── chat/             # 对话相关组件
│   │   ├── ChatArea.tsx      # 对话主区域
│   │   ├── MessageList.tsx   # 消息列表
│   │   ├── MessageBubble.tsx # 消息气泡
│   │   └── MessageInput.tsx  # 消息输入框
│   │
│   ├── session/          # 会话相关组件
│   │   ├── SessionList.tsx   # 会话列表
│   │   └── SessionItem.tsx   # 会话项
│   │
│   ├── config/           # 配置相关组件
│   │   ├── ModelSelector.tsx    # 模型选择器
│   │   └── SettingsPanel.tsx    # 设置面板
│   │
│   └── ui/               # shadcn/ui 组件
│       ├── button.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── ...           # 其他 shadcn/ui 组件
│
├── lib/                  # 工具库
│   ├── api.ts           # API 客户端
│   ├── user-id.ts       # 用户标识管理
│   └── utils.ts         # 工具函数
│
├── hooks/               # 自定义 Hooks
│   ├── useChat.ts      # 对话管理
│   ├── useSession.ts   # 会话管理
│   └── useUserId.ts    # 用户标识 Hook
│
└── types/              # TypeScript 类型定义
    ├── chat.ts        # 对话类型
    ├── session.ts     # 会话类型
    └── message.ts     # 消息类型
```

### 3.2 用户标识方案

使用 localStorage 存储匿名用户标识，无需注册登录：

```typescript
// lib/user-id.ts
export function getUserId(): string {
  let userId = localStorage.getItem('user_id');
  
  if (!userId) {
    userId = generateUUID();
    localStorage.setItem('user_id', userId);
  }
  
  return userId;
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
```

### 3.3 核心组件设计

#### 3.3.1 页面布局组件
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 flex flex-col">
            <Header />
            {children}
          </main>
          <ConfigPanel />
        </div>
      </body>
    </html>
  );
}
```

#### 3.3.2 对话区域组件
```typescript
// components/chat/ChatArea.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ChatArea() {
  const { messages, sendMessage, isLoading } = useChat();
  
  return (
    <div className="flex-1 flex flex-col">
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
```

### 3.4 状态管理

#### 3.4.1 全局状态
使用 React Context API 管理全局状态：
- 当前会话 ID
- 用户标识
- 全局配置

#### 3.4.2 本地状态
使用 useState 管理组件本地状态：
- 消息列表
- 输入框内容
- UI 展开/收起状态

### 3.5 API 调用

使用标准 fetch API 进行 HTTP 请求：

```typescript
// lib/api.ts
import { getUserId } from './user-id';

export async function sendMessage(sessionId: string, content: string) {
  const userId = getUserId();
  
  const response = await fetch('/api/messages', {
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
```

### 3.6 数据流设计

```
用户操作 → 触发事件 → 调用 Hook → 发起 HTTP 请求 → 等待响应 → 更新状态 → 重新渲染
```

## 4. 后端架构设计

### 4.1 模块结构

```
backend/src/
├── modules/
│   ├── session/           # 会话模块
│   │   ├── session.controller.ts
│   │   ├── session.service.ts
│   │   ├── session.module.ts
│   │   ├── entities/
│   │   │   └── session.entity.ts
│   │   └── dto/
│   │       ├── create-session.dto.ts
│   │       └── update-session.dto.ts
│   │
│   ├── message/           # 消息模块
│   │   ├── message.controller.ts
│   │   ├── message.service.ts
│   │   ├── message.module.ts
│   │   ├── entities/
│   │   │   └── message.entity.ts
│   │   └── dto/
│   │       └── create-message.dto.ts
│   │
│   └── ai/                # AI 服务模块
│       ├── ai.service.ts
│       ├── ai.module.ts
│       ├── providers/
│       │   ├── openai.provider.ts
│       │   └── base.provider.ts
│       └── dto/
│           └── ai-request.dto.ts
│
├── common/               # 公共模块
│   ├── filters/         # 异常过滤器
│   ├── interceptors/    # 拦截器
│   └── decorators/      # 装饰器
│       └── user-id.decorator.ts
│
├── config/             # 配置模块
│   ├── database.config.ts
│   └── app.config.ts
│
└── main.ts            # 应用入口
```

### 4.2 核心模块设计

#### 4.2.1 会话模块 (Session)
**职责**:
- 会话创建和管理
- 会话列表查询
- 会话历史记录

**主要接口**:
```typescript
POST   /api/sessions       # 创建新会话
GET    /api/sessions       # 获取会话列表 (通过 X-User-Id 请求头识别用户)
GET    /api/sessions/:id   # 获取会话详情
PUT    /api/sessions/:id   # 更新会话
DELETE /api/sessions/:id   # 删除会话
```

**用户标识处理**:
```typescript
// common/decorators/user-id.decorator.ts
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-user-id'];
  },
);

// session.controller.ts
@Get()
async getSessions(@UserId() userId: string) {
  return this.sessionService.findByUserId(userId);
}
```

#### 4.2.2 消息模块 (Message)
**职责**:
- 消息发送和接收
- 消息历史查询
- 与 AI 服务交互

**主要接口**:
```typescript
POST   /api/messages               # 发送消息
GET    /api/sessions/:id/messages  # 获取会话消息列表
DELETE /api/messages/:id           # 删除消息
```

**消息处理流程**:
```typescript
@Post()
async createMessage(
  @Body() dto: CreateMessageDto,
  @UserId() userId: string,
) {
  // 保存用户消息
  const userMessage = await this.messageService.create({
    sessionId: dto.sessionId,
    role: 'user',
    content: dto.content,
  });
  
  // 调用 AI 服务生成回复
  const aiResponse = await this.aiService.generateResponse(
    dto.content,
    dto.model,
  );
  
  // 保存 AI 回复
  const aiMessage = await this.messageService.create({
    sessionId: dto.sessionId,
    role: 'assistant',
    content: aiResponse,
  });
  
  return { userMessage, aiMessage };
}
```

#### 4.2.3 AI 服务模块 (AI)
**职责**:
- 对接 AI API (OpenAI 等)
- 多模型支持
- 参数配置管理

**核心服务**:
```typescript
@Injectable()
export class AIService {
  async generateResponse(
    prompt: string,
    model: string,
    options?: AIOptions
  ): Promise<string> {
    // 调用 AI API 生成响应
    const response = await this.openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      ...options,
    });
    
    return response.choices[0].message.content;
  }
  
  async getSupportedModels(): Promise<Model[]> {
    // 获取支持的模型列表
    return [
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
    ];
  }
}
```

### 4.3 数据库设计

#### 4.3.1 会话表 (sessions)
```sql
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
```

#### 4.3.2 消息表 (messages)
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

### 4.4 API 设计规范

#### 4.4.1 RESTful API 规范
- 使用标准 HTTP 方法: GET, POST, PUT, DELETE
- 统一的响应格式
- 合理的状态码使用

#### 4.4.2 统一响应格式
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
```

#### 4.4.3 用户识别
- 前端在所有请求中携带 `X-User-Id` 请求头
- 后端通过该请求头识别用户
- 无需 JWT 认证和会话管理

## 5. 数据流设计

### 5.1 消息发送流程

```
1. 用户输入 → 2. 前端验证 → 3. HTTP POST 请求 (带 X-User-Id)
                                    ↓
6. UI 更新 ← 5. 返回结果 ← 4. 后端处理 (保存消息 + 调用 AI + 保存回复)
```

### 5.2 会话管理流程

```
创建会话:
用户点击 → API 请求 (带 X-User-Id) → 创建会话记录 → 返回会话 ID → 切换当前会话

加载会话:
选择会话 → 加载会话信息 → 加载消息历史 → 渲染消息列表
```

### 5.3 用户标识流程

```
首次访问:
页面加载 → 检查 localStorage → 不存在 → 生成 UUID → 保存到 localStorage

后续访问:
页面加载 → 检查 localStorage → 存在 → 使用已有 UUID
```

## 6. 部署架构

### 6.1 开发环境
```
开发者本地 → localhost:3000 (前端) + localhost:4000 (后端) + PostgreSQL
```

### 6.2 生产环境
```
用户 → Next.js 服务器 (前端) → Nest.js 服务器 (后端) → PostgreSQL → AI API
```

### 6.3 容器化部署
```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
      
  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/chatbot
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - db
      
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=chatbot
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

## 7. 开发规范

### 7.1 代码规范
- ESLint + Prettier
- TypeScript 严格模式
- Git Commit 规范 (Conventional Commits)

### 7.2 测试策略
- 单元测试 (Jest)
- E2E 测试 (Playwright)
- API 测试

### 7.3 文档规范
- API 文档 (Swagger / OpenAPI)
- 代码注释
- 架构文档

## 8. 总结

本架构设计采用极简化方案，注重实用性和快速开发：

### 8.1 技术优势
- **前端**: Next.js + React + shadcn/ui 提供完整的 UI 组件库
- **后端**: Nest.js 提供清晰的模块化架构
- **数据库**: PostgreSQL 提供可靠的数据持久化
- **用户识别**: localStorage 实现无需注册的匿名用户系统

### 8.2 系统特性
- **极简设计**: 移除所有非必要的复杂组件
- **易于开发**: 使用标准 HTTP 请求，无需处理实时连接
- **快速部署**: 最小化依赖，简化部署流程
- **用户友好**: 无需注册即可使用，数据通过浏览器标识关联

### 8.3 架构特点
- **无需认证**: 使用 localStorage 存储匿名用户 ID
- **无需流式**: 使用标准 HTTP 请求和响应
- **无需缓存**: 直接查询数据库
- **仅 PostgreSQL**: 统一使用 PostgreSQL 数据库
- **使用 shadcn/ui**: 无需自建 UI 组件系统
