# 智能客服系统 - Claude 项目规范

## 项目概述

这是一个基于 AI 的智能客服对话系统，采用前后端分离架构，提供流畅的人机交互体验。系统支持多模型切换、会话管理和个性化配置功能。

## 技术栈

### 后端
- **运行时**: Node.js
- **框架**: Nest.js
- **语言**: TypeScript
- **API 风格**: RESTful API
- **数据库**: PostgreSQL
- **ORM**: TypeORM / Prisma

### 前端
- **框架**: React
- **应用框架**: Next.js (App Router)
- **语言**: TypeScript
- **UI 组件库**: shadcn/ui
- **样式**: Tailwind CSS
- **状态管理**: React Context API + Local State
- **HTTP 客户端**: fetch API

## 项目结构

```
qiniu-hackathon/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── modules/     # 功能模块
│   │   │   ├── session/ # 会话管理
│   │   │   ├── message/ # 消息处理
│   │   │   └── ai/      # AI 服务集成
│   │   ├── common/      # 公共模块
│   │   ├── config/      # 配置文件
│   │   └── main.ts      # 应用入口
│   └── test/            # 测试文件
│
├── frontend/            # 前端应用
│   ├── src/
│   │   ├── app/        # Next.js App Router
│   │   ├── components/ # React 组件
│   │   │   ├── layout/ # 布局组件
│   │   │   ├── chat/   # 对话组件
│   │   │   ├── session/ # 会话组件
│   │   │   ├── config/ # 配置组件
│   │   │   └── ui/     # shadcn/ui 组件
│   │   ├── lib/        # 工具库
│   │   ├── hooks/      # 自定义 Hooks
│   │   └── types/      # TypeScript 类型
│   └── public/         # 静态资源
│
└── docs/               # 文档
    ├── ARCHITECTURE.md # 架构设计
    └── PROTOTYPE.md    # 页面原型
```

## 编码规范

### TypeScript

1. **严格模式**: 启用 TypeScript 严格模式
   ```json
   {
     "strict": true,
     "noImplicitAny": true,
     "strictNullChecks": true
   }
   ```

2. **类型定义**: 
   - 优先使用接口 (interface) 定义对象类型
   - 使用类型别名 (type) 定义联合类型和复杂类型
   - 避免使用 `any`，必要时使用 `unknown`

3. **命名约定**:
   - 组件: PascalCase (如 `ChatArea`, `MessageBubble`)
   - 文件: kebab-case (如 `chat-area.tsx`, `message-bubble.tsx`)
   - 变量/函数: camelCase (如 `userId`, `sendMessage`)
   - 常量: UPPER_SNAKE_CASE (如 `API_BASE_URL`)
   - 类型/接口: PascalCase (如 `Message`, `Session`)

### React/Next.js

1. **组件规范**:
   - 使用函数组件和 Hooks
   - 导出组件使用命名导出
   - 组件文件与组件名保持一致

2. **Hooks 使用**:
   - 自定义 Hooks 以 `use` 开头
   - 遵循 Hooks 使用规则
   - 合理使用 `useMemo` 和 `useCallback` 优化性能

3. **shadcn/ui 组件**:
   - 优先使用 shadcn/ui 提供的 UI 组件
   - 需要自定义样式时使用 Tailwind CSS
   - 组件存放在 `components/ui/` 目录

### Nest.js

1. **模块化**:
   - 每个功能独立为模块
   - 使用依赖注入
   - 合理划分 Controller、Service、Entity

2. **装饰器**:
   - 使用 `@Injectable()` 标记服务
   - 使用 `@Controller()` 标记控制器
   - 使用自定义装饰器如 `@UserId()` 提取用户标识

3. **错误处理**:
   - 使用 Nest.js 内置异常类
   - 实现全局异常过滤器
   - 返回统一的错误响应格式

### 样式规范

1. **Tailwind CSS**:
   - 优先使用 Tailwind 工具类
   - 避免在 JSX 中写过长的 className
   - 复杂样式可提取为组件

2. **配色方案**:
   - 主色调: 深蓝色/深灰色背景
   - 强调色: 蓝色高亮
   - 文字: 白色/浅灰色
   - 深色主题风格

3. **响应式设计**:
   - 使用 Tailwind 响应式前缀 (sm:, md:, lg:, xl:)
   - 支持移动端优化
   - 侧边栏在小屏幕上可收起

## 核心功能实现

### 用户标识系统

系统采用 localStorage 实现匿名用户识别，无需注册登录：

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
```

**后端接收用户标识**:
```typescript
// common/decorators/user-id.decorator.ts
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-user-id'];
  },
);
```

### API 设计规范

#### RESTful API 约定

1. **请求头**:
   - `Content-Type: application/json`
   - `X-User-Id: <uuid>` (用户标识)

2. **响应格式**:
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

3. **HTTP 状态码**:
   - 200: 成功
   - 201: 创建成功
   - 400: 请求错误
   - 404: 资源不存在
   - 500: 服务器错误

#### 核心 API 接口

**会话管理**:
```
POST   /api/sessions       # 创建新会话
GET    /api/sessions       # 获取会话列表
GET    /api/sessions/:id   # 获取会话详情
PUT    /api/sessions/:id   # 更新会话
DELETE /api/sessions/:id   # 删除会话
```

**消息管理**:
```
POST   /api/messages               # 发送消息
GET    /api/sessions/:id/messages  # 获取会话消息列表
DELETE /api/messages/:id           # 删除消息
```

### 数据库设计

#### 会话表 (sessions)
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

#### 消息表 (messages)
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

## 开发流程

### 本地开发

1. **环境准备**:
   ```bash
   # 安装依赖
   cd backend && npm install
   cd ../frontend && npm install
   
   # 配置环境变量
   cp backend/.env.example backend/.env
   ```

2. **启动服务**:
   ```bash
   # 启动数据库
   docker-compose up -d db
   
   # 启动后端 (端口 4000)
   cd backend && npm run start:dev
   
   # 启动前端 (端口 3000)
   cd frontend && npm run dev
   ```

3. **访问应用**:
   - 前端: http://localhost:3000
   - 后端: http://localhost:4000

### 代码提交规范

使用 Conventional Commits 规范:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type)**:
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链更新

**示例**:
```
feat(chat): 添加消息流式显示功能

实现了 AI 回复的流式显示效果，提升用户体验

Closes #123
```

### 测试策略

1. **单元测试**: Jest
   - 测试工具函数
   - 测试 React Hooks
   - 测试 Service 层业务逻辑

2. **E2E 测试**: Playwright
   - 测试核心用户流程
   - 测试关键交互功能

3. **API 测试**:
   - 测试所有 API 端点
   - 测试边界情况和错误处理

## 性能优化

### 前端优化

1. **代码分割**:
   - 使用 Next.js 动态导入
   - 按路由分割代码
   - 延迟加载非关键组件

2. **状态管理**:
   - 合理使用 Context，避免不必要的重渲染
   - 使用 `useMemo` 缓存计算结果
   - 使用 `useCallback` 缓存函数引用

3. **资源优化**:
   - 图片使用 Next.js Image 组件
   - 启用 Gzip/Brotli 压缩
   - 使用 CDN 加速静态资源

### 后端优化

1. **数据库优化**:
   - 合理使用索引
   - 避免 N+1 查询问题
   - 分页加载历史消息

2. **API 响应优化**:
   - 实现响应缓存
   - 压缩响应数据
   - 异步处理耗时操作

## 部署指南

### Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### 环境变量

**后端必需的环境变量**:
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/chatbot
OPENAI_API_KEY=your_openai_api_key
PORT=4000
```

**前端必需的环境变量**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 注意事项

### 安全性

1. **环境变量**: 敏感信息使用环境变量，不要提交到代码库
2. **API Key**: AI API Key 只在后端使用，不暴露给前端
3. **输入验证**: 所有用户输入必须验证和清理
4. **SQL 注入**: 使用 ORM 参数化查询

### 最佳实践

1. **组件设计**: 保持组件单一职责，易于测试和维护
2. **代码复用**: 提取公共逻辑为 Hooks 或工具函数
3. **错误处理**: 实现全局错误处理和友好的错误提示
4. **日志记录**: 关键操作记录日志，便于排查问题
5. **文档更新**: 代码变更同步更新文档

## 与 AI 协作指南

### 文件操作

- 优先编辑现有文件，避免创建新文件
- 遵循项目现有的代码风格和结构
- 保持文件组织清晰，功能模块化

### 代码质量

- 确保所有代码符合 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 规则
- 保持代码简洁、可读、可维护

### 功能开发

- 开发新功能前先理解现有架构
- 参考 `docs/ARCHITECTURE.md` 和 `docs/PROTOTYPE.md`
- 保持前后端接口一致性

### 测试和验证

- 开发完成后运行测试确保功能正常
- 检查类型错误: `npm run typecheck`
- 检查代码规范: `npm run lint`

## 相关文档

- [架构设计文档](docs/ARCHITECTURE.md)
- [页面原型设计](docs/PROTOTYPE.md)
- [README](README.md)

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。
