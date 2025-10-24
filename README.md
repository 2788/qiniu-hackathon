# qiniu-hackathon
hackathon for AI

## 本地开发运行说明

### 环境要求
- Node.js 22
- Docker 和 Docker Compose（用于数据库）

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

2. 启动开发环境

**使用 Docker Compose（推荐）**
```bash
# 在项目根目录执行
docker-compose up
```
访问 http://localhost:3000 查看前端应用，后端 API 运行在 http://localhost:4000

**或者分别启动**
```bash
# 启动数据库
docker-compose up db

# 启动后端（在 backend 目录）
npm run start:dev

# 启动前端（在 frontend 目录）
npm run dev
```

### 项目结构
- `frontend/` - Next.js 前端应用（端口 3000）
- `backend/` - NestJS 后端应用（端口 4000）
- `docker-compose.yml` - Docker 编排配置
