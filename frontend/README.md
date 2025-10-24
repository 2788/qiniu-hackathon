# 智能客服系统 - 前端

基于 Next.js + React + TypeScript + Tailwind CSS + shadcn/ui 的智能客服系统前端应用。

## 技术栈

- **框架**: React 18 + Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **UI 组件**: shadcn/ui
- **包管理**: npm

## 目录结构

```
frontend/src/
├── app/                # Next.js App Router
│   ├── layout.tsx     # 根布局
│   ├── page.tsx       # 首页
│   └── globals.css    # 全局样式
│
├── components/        # React 组件
│   ├── layout/       # 布局组件
│   ├── chat/         # 对话相关组件
│   ├── session/      # 会话相关组件
│   ├── config/       # 配置相关组件
│   └── ui/           # shadcn/ui 组件
│
├── lib/              # 工具库
│   ├── api.ts        # API 客户端
│   ├── user-id.ts    # 用户标识管理
│   └── utils.ts      # 工具函数
│
├── hooks/           # 自定义 Hooks
│   ├── useChat.ts   # 对话管理
│   └── useSession.ts # 会话管理
│
└── types/          # TypeScript 类型定义
    ├── chat.ts     # 对话类型
    └── session.ts  # 会话类型
```

## 开发

### 安装依赖

```bash
npm install
```

### 环境配置

复制 `.env.example` 为 `.env.local` 并配置：

```bash
cp .env.example .env.local
```

### 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 构建

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 功能特性

- ✅ 深色主题 UI
- ✅ 会话管理
- ✅ 实时对话
- ✅ 代码高亮
- ✅ Markdown 渲染
- ✅ 模型切换
- ✅ 响应式布局
- ✅ 无需注册，使用 localStorage 存储用户标识

## 用户标识

系统使用 localStorage 存储匿名用户标识（UUID），无需注册登录。首次访问时自动生成并保存用户 ID。

## API 调用

前端通过标准 fetch API 与后端通信，所有请求携带 `X-User-Id` 请求头用于用户识别。

## shadcn/ui 组件

使用 shadcn/ui 添加 UI 组件：

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add select
```

## 开发规范

- ESLint + Prettier 代码格式化
- TypeScript 严格模式
- 组件使用函数式写法
- 使用 Tailwind CSS 进行样式开发
