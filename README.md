# qiniu-hackathon

议题1：智能客服

## 本地开发运行说明

### 环境要求
- Node.js 22
- PostgreSQL

### 快速开始

1. 安装依赖
```bash
# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

2. 准备数据库

- 创建表及建立索引，见 [db.sql](./backend/migrations/db.sql) 文件
- 导入客服数据参考 [DEPLOYMENT.md](./backend/data/DEPLOYMENT.md)


3. 启动开发环境

**分别启动**
```bash
# 启动后端（在 backend 目录）
npm run start:dev

# 启动前端（在 frontend 目录）
npm run dev
```

访问 http://localhost:3000 查看前端应用，后端 API 运行在 http://localhost:4000

### 项目结构
- `frontend/` - Next.js 前端应用（端口 3000）
- `backend/` - NestJS 后端应用（端口 4000）
