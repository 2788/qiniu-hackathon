# 人工客服数据接入 - 部署指南

## 功能概述

本次改造实现了智能客服系统与历史人工客服数据的集成,采用简化版 RAG (检索增强生成) 方案:

- ✅ 新建 `knowledge_base` 表存储历史客服数据
- ✅ 基于关键词匹配查询相关工单
- ✅ 将匹配结果注入 AI Prompt 增强回答质量
- ✅ 前端零改动,保持接口完全兼容
- ✅ 支持多轮对话,历史消息作为上下文

## 部署步骤

### 1. 准备数据文件

将客服数据 JSON 文件放置到 `backend/data/customer-service.json`:

```bash
cp /path/to/your/customer-service.json backend/data/customer-service.json
```

**数据格式要求**:
```json
[
  {
    "id": 397413,
    "title": "问题标题",
    "description": "问题描述",
    "category": "问题分类",
    "replies": [
      {"content": "用户提问(HTML格式)", "owner": "customer"},
      {"content": "客服回复(HTML格式)", "owner": "agent"}
    ]
  }
]
```

### 2. 创建数据库表

执行数据库迁移脚本:

```bash
psql -h localhost -U chatbot -d chatbot -f backend/migrations/001_create_knowledge_base.sql
```

或使用 Docker:

```bash
docker exec -i postgres_container psql -U chatbot -d chatbot < backend/migrations/001_create_knowledge_base.sql
```

### 3. 导入数据

运行数据导入脚本:

```bash
cd backend
npm run import-knowledge
```

**导入过程**:
- 读取 JSON 文件
- 将 HTML 内容转换为纯文本
- 提取关键词用于检索
- 批量导入数据库

**预期输出**:
```
读取数据文件...
读取到 XXXX 条客服记录
连接数据库...
数据库连接成功
清空现有知识库数据...
开始导入数据...
已导入 100/XXXX 条记录...
已导入 200/XXXX 条记录...
...
导入完成!
成功: XXXX 条
失败: 0 条
```

### 4. 重启后端服务

```bash
cd backend
npm run start:dev
```

或生产环境:

```bash
cd backend
npm run build
npm run start:prod
```

### 5. 验证功能

访问前端应用,提问与历史工单相关的问题,验证 AI 是否参考了历史案例进行回答。

**测试建议**:
- 提问历史工单中出现过的问题
- 检查 AI 回复是否引用了相关案例
- 验证多轮对话是否正常工作

## 技术实现

### 数据库设计

**knowledge_base 表结构**:
```sql
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY,
  ticket_id INTEGER NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  conversation JSONB NOT NULL,
  keywords TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**索引**:
- `idx_kb_ticket_id`: 工单 ID 索引
- `idx_kb_category`: 分类索引
- `idx_kb_keywords`: 关键词 GIN 索引(支持数组查询)
- `idx_kb_title`: 标题全文索引

### 核心模块

1. **Knowledge Entity** (`backend/src/modules/knowledge/knowledge.entity.ts`)
   - TypeORM 实体定义
   - 自动生成 UUID
   - JSONB 存储对话记录

2. **Knowledge Service** (`backend/src/modules/knowledge/knowledge.service.ts`)
   - `searchRelevant()`: 基于关键词检索相关工单
   - `extractKeywords()`: 提取查询关键词
   - `formatAsContext()`: 格式化为 AI 可用的上下文

3. **AI Service** (`backend/src/modules/ai/ai.service.ts`)
   - 集成 Knowledge Service
   - 自动检索相关历史案例
   - 将知识注入 System Prompt

### 工作流程

```
用户提问
    ↓
提取关键词
    ↓
数据库检索 (keywords && 数组查询)
    ↓
匹配 Top 3 相关工单
    ↓
格式化为上下文文本
    ↓
注入 AI System Prompt
    ↓
调用 OpenAI API
    ↓
返回增强的回答
```

## 性能优化

### 当前实现
- 基于关键词数组查询 (PostgreSQL `&&` 操作符)
- GIN 索引加速查询
- 限制返回 Top 3 工单控制 Token 消耗

### 未来优化方向
1. **短期** (1-2周):
   - 增加 TF-IDF 权重计算
   - 支持分类优先级匹配
   - 添加缓存机制

2. **中期** (1个月):
   - 升级为 PostgreSQL 全文搜索 (tsvector)
   - 配置中文分词插件
   - 添加知识库管理接口

3. **长期** (3个月+):
   - 引入 pgvector 扩展
   - 使用 Embedding 模型
   - 实现语义检索

## 监控与日志

### 数据库查询监控

检查知识库数据量:
```sql
SELECT COUNT(*) FROM knowledge_base;
```

查看示例数据:
```sql
SELECT id, ticket_id, title, category, keywords 
FROM knowledge_base 
LIMIT 5;
```

测试关键词匹配:
```sql
SELECT title, category 
FROM knowledge_base 
WHERE keywords && ARRAY['SSL', '证书', '验证']
LIMIT 3;
```

### 应用日志

后端日志会显示:
- 知识库检索查询
- 匹配到的工单数量
- AI API 调用情况

## 故障排查

### 问题: 导入脚本失败

**可能原因**:
- 数据文件路径错误
- 数据库连接失败
- JSON 格式错误

**解决方法**:
```bash
# 检查文件是否存在
ls -lh backend/data/customer-service.json

# 验证 JSON 格式
node -e "JSON.parse(require('fs').readFileSync('backend/data/customer-service.json', 'utf-8'))"

# 测试数据库连接
psql -h localhost -U chatbot -d chatbot -c "SELECT 1"
```

### 问题: AI 没有引用历史案例

**可能原因**:
- 关键词匹配不到相关工单
- 数据库中没有数据

**解决方法**:
```sql
-- 检查数据是否导入成功
SELECT COUNT(*) FROM knowledge_base;

-- 测试关键词匹配
SELECT * FROM knowledge_base WHERE keywords && ARRAY['测试', '关键词'] LIMIT 1;
```

### 问题: 查询性能慢

**解决方法**:
```sql
-- 检查索引是否创建
SELECT indexname FROM pg_indexes WHERE tablename = 'knowledge_base';

-- 重建索引
REINDEX TABLE knowledge_base;

-- 分析查询计划
EXPLAIN ANALYZE 
SELECT * FROM knowledge_base 
WHERE keywords && ARRAY['SSL', '证书'] 
LIMIT 3;
```

## 环境变量

无需额外环境变量,使用现有数据库配置:

```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=chatbot
DATABASE_PASSWORD=chatbot
DATABASE_NAME=chatbot
```

## 回滚方案

如需回滚此功能:

```bash
# 1. 切换到主分支
git checkout main

# 2. 删除知识库表
psql -h localhost -U chatbot -d chatbot -c "DROP TABLE IF EXISTS knowledge_base CASCADE;"

# 3. 重启服务
cd backend && npm run start:prod
```

## 联系方式

如有问题请提交 Issue 或联系开发团队。
