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
- **数据库**: SQLite (开发) / PostgreSQL (生产)

#### 前端技术栈
- **框架**: React
- **应用框架**: Next.js
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **架构**: 小型单页应用架构

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
│   │   ├── types/      # TypeScript 类型定义
│   │   └── styles/     # 样式文件
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
                            ↕ HTTP/SSE
┌─────────────────────────────────────────────────────────────┐
│                        前端应用层                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   React 组件库    │  │   状态管理        │                │
│  │  - UI Components │  │  - Context API   │                │
│  │  - Layout        │  │  - Local State   │                │
│  └──────────────────┘  └──────────────────┘                │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   API Client     │  │   SSE Client     │                │
│  │  - HTTP Client   │  │  - Stream        │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                            ↕ API Calls
┌─────────────────────────────────────────────────────────────┐
│                        后端服务层                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 会话模块  │  │ 消息模块  │  │ AI模块   │  │ 用户模块  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                        数据持久层                             │
│  ┌──────────────────┐                                       │
│  │   数据库          │                                       │
│  │  - 用户数据       │                                       │
│  │  - 会话记录       │                                       │
│  │  - 消息历史       │                                       │
│  └──────────────────┘                                       │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                        外部服务层                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   AI API 服务     │  │   其他服务        │                │
│  │  - OpenAI        │  │  - 日志服务       │                │
│  │  - 其他AI模型     │  │                  │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术架构分层

#### 2.2.1 前端架构
- **视图层**: React 组件 + Tailwind CSS
- **逻辑层**: Custom Hooks + 业务逻辑
- **数据层**: Context API + Local State
- **通信层**: Fetch API + Server-Sent Events (SSE)

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
│   │   ├── Sidebar.tsx   # 左侧边栏
│   │   └── ConfigPanel.tsx # 右侧配置面板
│   │
│   ├── chat/             # 对话相关组件
│   │   ├── ChatArea.tsx      # 对话主区域
│   │   ├── MessageList.tsx   # 消息列表
│   │   ├── MessageBubble.tsx # 消息气泡
│   │   ├── MessageInput.tsx  # 消息输入框
│   │   └── CodeBlock.tsx     # 代码块展示
│   │
│   ├── session/          # 会话相关组件
│   │   ├── SessionList.tsx   # 会话列表
│   │   ├── SessionItem.tsx   # 会话项
│   │   └── NewSessionButton.tsx # 新建会话按钮
│   │
│   ├── config/           # 配置相关组件
│   │   ├── ModelSelector.tsx    # 模型选择器
│   │   ├── ParameterSlider.tsx  # 参数滑块
│   │   └── SettingsPanel.tsx    # 设置面板
│   │
│   └── ui/               # 通用 UI 组件
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── Toggle.tsx
│
├── lib/                  # 工具库
│   ├── api/             # API 客户端
│   │   ├── client.ts    # HTTP 客户端
│   │   ├── stream.ts    # SSE 流式处理
│   │   └── endpoints.ts # API 端点定义
│   │
│   ├── utils/           # 工具函数
│   │   ├── formatter.ts # 格式化工具
│   │   ├── validator.ts # 验证工具
│   │   └── markdown.ts  # Markdown 处理
│   │
│   └── constants.ts     # 常量定义
│
├── hooks/               # 自定义 Hooks
│   ├── useChat.ts      # 对话管理
│   ├── useSession.ts   # 会话管理
│   ├── useStream.ts    # 流式响应处理
│   └── useSettings.ts  # 设置管理
│
├── types/              # TypeScript 类型定义
│   ├── chat.ts        # 对话类型
│   ├── session.ts     # 会话类型
│   ├── message.ts     # 消息类型
│   └── config.ts      # 配置类型
│
└── styles/            # 样式文件
    └── theme.css      # 主题变量
```

### 3.2 核心组件设计

#### 3.2.1 页面布局组件
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="flex h-screen bg-gray-900">
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

#### 3.2.2 对话区域组件
```typescript
// components/chat/ChatArea.tsx
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

#### 3.2.3 消息组件
```typescript
// components/chat/MessageBubble.tsx
interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function MessageBubble({ role, content, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-2xl px-4 py-2 rounded-lg ${
        role === 'user' ? 'bg-blue-600' : 'bg-gray-700'
      }`}>
        <MarkdownContent content={content} />
        <span className="text-xs text-gray-400">{formatTime(timestamp)}</span>
      </div>
    </div>
  );
}
```

### 3.3 状态管理策略

#### 3.3.1 全局状态
使用 React Context API 管理全局状态：
- 用户认证状态
- 当前会话 ID
- 全局配置

#### 3.3.2 本地状态
使用 useState/useReducer 管理组件本地状态：
- 消息列表
- 输入框内容
- UI 展开/收起状态

#### 3.3.3 服务端状态
使用自定义 Hooks 管理服务端状态：
- API 请求状态
- 缓存数据
- 流式响应处理

### 3.4 数据流设计

```
用户操作 → 触发事件 → 调用 Hook → 发起 API 请求 → 更新状态 → 重新渲染
                                      ↓
                            SSE 流式响应 → 逐步更新状态 → 实时渲染
```

### 3.5 流式响应处理

使用 Server-Sent Events (SSE) 实现流式响应：

```typescript
// hooks/useStream.ts
export function useStream() {
  const [content, setContent] = useState('');
  
  const streamMessage = async (prompt: string) => {
    const response = await fetch('/api/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      setContent(prev => prev + chunk);
    }
  };
  
  return { content, streamMessage };
}
```

## 4. 后端架构设计

### 4.1 模块结构

```
backend/src/
├── modules/
│   ├── auth/              # 认证授权模块
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   └── guards/
│   │       └── jwt-auth.guard.ts
│   │
│   ├── user/              # 用户模块
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.module.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   │       └── update-user.dto.ts
│   │
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
│   │   └── http-exception.filter.ts
│   ├── interceptors/    # 拦截器
│   │   └── logging.interceptor.ts
│   ├── pipes/          # 管道
│   │   └── validation.pipe.ts
│   ├── decorators/     # 装饰器
│   │   └── user.decorator.ts
│   └── utils/          # 工具函数
│       └── helper.ts
│
├── config/             # 配置模块
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts
│
└── main.ts            # 应用入口
```

### 4.2 核心模块设计

#### 4.2.1 认证授权模块 (Auth)
**职责**:
- 用户注册和登录
- JWT Token 生成和验证
- 用户身份认证

**主要接口**:
```typescript
POST /api/auth/register   # 用户注册
POST /api/auth/login      # 用户登录
POST /api/auth/logout     # 用户登出
GET  /api/auth/profile    # 获取当前用户信息
```

#### 4.2.2 用户模块 (User)
**职责**:
- 用户信息管理
- 用户设置管理
- 用户偏好配置

**主要接口**:
```typescript
GET    /api/users/:id      # 获取用户信息
PUT    /api/users/:id      # 更新用户信息
DELETE /api/users/:id      # 删除用户
GET    /api/users/:id/settings  # 获取用户设置
PUT    /api/users/:id/settings  # 更新用户设置
```

#### 4.2.3 会话模块 (Session)
**职责**:
- 会话创建和管理
- 会话列表查询
- 会话历史记录

**主要接口**:
```typescript
POST   /api/sessions       # 创建新会话
GET    /api/sessions       # 获取会话列表
GET    /api/sessions/:id   # 获取会话详情
PUT    /api/sessions/:id   # 更新会话
DELETE /api/sessions/:id   # 删除会话
```

#### 4.2.4 消息模块 (Message)
**职责**:
- 消息发送和接收
- 消息历史查询
- 流式响应处理

**主要接口**:
```typescript
POST   /api/messages               # 发送消息
POST   /api/messages/stream        # 流式发送消息 (SSE)
GET    /api/sessions/:id/messages  # 获取会话消息列表
DELETE /api/messages/:id           # 删除消息
```

**流式响应实现**:
```typescript
@Post('stream')
async streamMessage(@Body() dto: CreateMessageDto, @Res() res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const stream = await this.aiService.generateStream(dto.content);
  
  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
  }
  
  res.write('data: [DONE]\n\n');
  res.end();
}
```

#### 4.2.5 AI 服务模块 (AI)
**职责**:
- 对接 AI API (OpenAI 等)
- 流式响应处理
- 多模型支持
- 参数配置管理

**核心服务**:
```typescript
@Injectable()
export class AIService {
  async generateResponse(
    prompt: string,
    model: string,
    options: AIOptions
  ): Promise<string> {
    // 调用 AI API 生成完整响应
  }
  
  async *generateStream(
    prompt: string,
    model: string,
    options: AIOptions
  ): AsyncGenerator<string> {
    // 调用 AI API 生成流式响应
  }
  
  async getSupportedModels(): Promise<Model[]> {
    // 获取支持的模型列表
  }
}
```

### 4.3 数据库设计

#### 4.3.1 用户表 (users)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.3.2 会话表 (sessions)
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

#### 4.3.3 消息表 (messages)
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

#### 4.3.4 用户设置表 (user_settings)
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  default_model VARCHAR(50),
  theme VARCHAR(20) DEFAULT 'dark',
  language VARCHAR(10) DEFAULT 'zh-CN',
  ai_parameters JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4.4 API 设计规范

#### 4.4.1 RESTful API 规范
- 使用标准 HTTP 方法: GET, POST, PUT, DELETE
- 统一的响应格式
- 合理的状态码使用
- API 版本控制 (/api/v1/)

#### 4.4.2 统一响应格式
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

#### 4.4.3 错误处理
```typescript
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      success: false,
      error: {
        code: exception.name,
        message: exception.message,
        statusCode: status,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

## 5. 数据流设计

### 5.1 消息发送流程

```
1. 用户输入 → 2. 前端验证 → 3. HTTP POST 请求
                                    ↓
8. UI 更新 ← 7. 前端接收流 ← 6. SSE 推送 ← 5. AI 生成 ← 4. 后端处理
                                    ↓
                              数据库保存
```

### 5.2 会话管理流程

```
创建会话:
用户点击 → API 请求 → 创建会话记录 → 返回会话 ID → 切换当前会话

加载会话:
选择会话 → 加载会话信息 → 加载消息历史 → 渲染消息列表
```

### 5.3 模型切换流程

```
用户选择模型 → 更新会话配置 → API 保存 → 更新前端状态 → 后续消息使用新模型
```

## 6. 安全设计

### 6.1 认证授权
- JWT Token 认证
- Token 刷新机制
- 用户权限管理
- API 访问控制

### 6.2 数据安全
- 密码加密存储 (bcrypt)
- HTTPS 传输加密
- SQL 注入防护 (使用 ORM)
- XSS 攻击防护 (输入清理、输出转义)

### 6.3 接口安全
- 请求频率限制 (Rate Limiting)
- API Key 管理
- CORS 配置
- 输入验证和清理

## 7. 性能优化

### 7.1 前端优化
- 代码分割和懒加载 (Next.js 自动实现)
- 图片懒加载
- 虚拟滚动 (长消息列表)
- 防抖和节流
- 客户端缓存策略

### 7.2 后端优化
- 数据库索引优化
- 查询优化 (避免 N+1 问题)
- 连接池管理
- 异步处理
- 简单的内存缓存

### 7.3 通信优化
- HTTP/2 支持
- 流式响应 (SSE)
- 响应压缩 (Gzip)
- CDN 加速 (静态资源)

## 8. 部署架构

### 8.1 开发环境
```
开发者本地 → localhost:3000 (前端) + localhost:4000 (后端) + SQLite
```

### 8.2 生产环境
```
用户 → CDN (静态资源) → Nginx (反向代理)
                           ↓
                    Next.js 服务器 (前端)
                           ↓
                    Nest.js 服务器 (后端)
                           ↓
                    PostgreSQL (数据库) → AI API 服务
```

### 8.3 容器化部署
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
      - JWT_SECRET=${JWT_SECRET}
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

## 9. 监控和日志

### 9.1 日志系统
- 应用日志 (Winston / Pino)
- 访问日志
- 错误日志
- 审计日志

### 9.2 监控指标
- API 响应时间
- 数据库查询性能
- 错误率统计
- 资源使用率

### 9.3 告警机制
- 错误率告警
- 性能告警
- 资源告警

## 10. 扩展性设计

### 10.1 水平扩展
- 无状态服务设计
- 负载均衡
- 数据库读写分离 (按需)

### 10.2 功能扩展
- 多语言支持
- 主题定制
- 导出对话历史
- 分享对话功能

### 10.3 接口扩展
- 更多 AI 模型支持
- 第三方集成
- Webhook 支持

## 11. 开发规范

### 11.1 代码规范
- ESLint + Prettier
- TypeScript 严格模式
- Git Commit 规范 (Conventional Commits)
- 代码审查流程

### 11.2 测试策略
- 单元测试 (Jest)
- 集成测试
- E2E 测试 (Playwright)
- API 测试

### 11.3 文档规范
- API 文档 (Swagger / OpenAPI)
- 代码注释
- 架构文档
- 部署文档

## 12. 总结

本架构设计基于现代化的技术栈，采用前后端分离的架构模式，注重简洁和实用性：

### 12.1 技术优势
- **前端**: Next.js + React + TypeScript 提供类型安全和优秀的开发体验
- **后端**: Nest.js 提供企业级的架构设计和模块化能力
- **实时通信**: Server-Sent Events (SSE) 实现流式响应，简单高效
- **可扩展性**: 模块化设计便于功能扩展和维护

### 12.2 系统特性
- **简洁高效**: 避免过度设计，使用成熟的技术方案
- **易于部署**: 最小化依赖，降低运维复杂度
- **安全性**: JWT 认证、数据加密、接口防护
- **可维护性**: 清晰的代码结构、完善的文档、测试覆盖
- **用户体验**: 深色主题、流式响应、流畅动画

### 12.3 架构特点
- **无需 WebSocket**: 使用 HTTP + SSE 实现流式响应，降低复杂度
- **无需 Redis**: 使用简单的内存缓存和数据库优化
- **无需消息队列**: 直接调用 AI API，异步处理即可满足需求
- **数据库灵活**: 开发环境使用 SQLite，生产环境使用 PostgreSQL

### 12.4 后续优化方向
- 添加更多 AI 模型支持
- 完善监控和告警系统
- 优化数据库查询性能
- 实现智能缓存策略
- 支持更多文件格式和富文本内容
