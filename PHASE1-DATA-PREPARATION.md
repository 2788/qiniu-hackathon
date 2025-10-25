# 阶段 1: 数据准备 - 实施文档

## 完成内容

### 1. 数据库设计

创建了两个实体表用于存储人工客服知识库数据:

#### kb_tickets (工单表)
- `id`: UUID 主键
- `original_id`: 原始工单 ID (来自 JSON 文件)
- `title`: 工单标题
- `description`: 工单描述
- `category`: 分类 (如 "对象存储｜其他类咨询")
- `created_at`: 创建时间

**索引**:
- `idx_kb_tickets_category`: 按分类查询
- `idx_kb_tickets_original_id`: 按原始 ID 查询

#### kb_replies (回复表)
- `id`: UUID 主键
- `ticket_id`: 关联工单 ID (外键)
- `owner`: 回复者类型 (`customer` 或 `agent`)
- `content`: 回复内容 (可能包含 HTML)
- `sequence_order`: 回复顺序 (用于保持对话顺序)
- `created_at`: 创建时间

**索引**:
- `idx_kb_replies_ticket_id`: 按工单查询回复
- `idx_kb_replies_owner`: 按回复者类型查询

**关系**:
- `kb_replies.ticket_id` → `kb_tickets.id` (CASCADE DELETE)

### 2. 后端模块实现

创建了完整的 NestJS 知识库模块:

```
backend/src/modules/knowledge-base/
├── entities/
│   ├── kb-ticket.entity.ts      # 工单实体
│   └── kb-reply.entity.ts       # 回复实体
├── dto/
│   └── import-kb-data.dto.ts    # 数据导入 DTO
├── knowledge-base.controller.ts  # REST API 控制器
├── knowledge-base.service.ts     # 业务逻辑服务
├── knowledge-base.module.ts      # 模块定义
└── README.md                     # 模块文档
```

### 3. API 接口

#### POST /knowledge-base/import
导入知识库数据
```json
{
  "tickets": [
    {
      "id": 397413,
      "title": "...",
      "description": "...",
      "category": "...",
      "replies": [...]
    }
  ]
}
```

#### POST /knowledge-base/import-from-file
从文件导入数据
```json
{
  "filePath": "/path/to/data.json"
}
```

#### GET /knowledge-base/search
搜索工单
- 参数: `q` (搜索关键词), `category` (分类), `limit` (限制数量)
- 支持标题和描述的模糊搜索

#### GET /knowledge-base/tickets/:id
获取工单详情(包含所有回复)

#### DELETE /knowledge-base/clear
清空所有知识库数据

### 4. CLI 导入工具

创建了命令行工具 `src/scripts/import-kb-data.ts`:

```bash
# 导入数据
npm run import-kb /path/to/customer-service-data.json

# 清空现有数据后导入
npm run import-kb /path/to/customer-service-data.json -- --clear
```

**特性**:
- 批量导入处理
- 进度日志输出 (每 100 条记录)
- 错误处理和日志
- 保持回复顺序

### 5. 数据导入流程

1. 读取 JSON 文件
2. 解析工单数据
3. 遍历每个工单:
   - 创建 `kb_ticket` 记录
   - 为每个回复创建 `kb_reply` 记录
   - 设置 `sequence_order` 保持对话顺序
4. 每 100 条记录输出进度日志
5. 错误处理: 单个工单失败不影响其他工单

## 技术实现特点

### 1. 简单高效
- 使用 TypeORM 实体,无需手动编写 SQL
- 批量导入,性能优化
- 支持大文件处理 (160MB+)

### 2. 保留对话上下文
- `sequence_order` 字段保持回复顺序
- 查询时按顺序返回回复
- 支持多轮对话检索

### 3. 灵活搜索
- 支持全文搜索 (ILIKE)
- 分类筛选
- 可扩展为全文索引 (PostgreSQL FTS)

### 4. 最小改动
- 独立模块,不影响现有功能
- 仅添加新表,不修改现有表
- 前端无需改动 (阶段 1)

## 使用说明

### 安装依赖
```bash
cd backend
npm install
```

### 准备数据文件
将人工客服数据 JSON 文件放在项目目录,例如 `data/customer-service-data.json`

### 启动数据库
```bash
docker-compose up -d db
```

### 导入数据
```bash
npm run import-kb data/customer-service-data.json
```

### 启动服务
```bash
npm run start:dev
```

### 测试 API
```bash
# 搜索工单
curl "http://localhost:4000/knowledge-base/search?q=SSL证书&limit=5"

# 获取工单详情
curl "http://localhost:4000/knowledge-base/tickets/{ticket-id}"
```

## 数据格式说明

### 输入格式 (JSON)
```json
[
  {
    "id": 397413,
    "title": "问题标题",
    "description": "问题描述",
    "category": "对象存储｜其他类咨询",
    "replies": [
      {
        "content": "<p>内容 (可能包含 HTML)</p>",
        "owner": "customer"
      },
      {
        "content": "<p>回复内容</p>",
        "owner": "agent"
      }
    ]
  }
]
```

### 输出格式 (API 响应)
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "originalId": 397413,
      "title": "问题标题",
      "description": "问题描述",
      "category": "对象存储｜其他类咨询",
      "createdAt": "2025-10-25T12:00:00Z",
      "replies": [
        {
          "id": "uuid",
          "owner": "customer",
          "content": "<p>内容</p>",
          "sequenceOrder": 0,
          "createdAt": "2025-10-25T12:00:00Z"
        }
      ]
    }
  ]
}
```

## 测试数据

提供了测试数据样本文件: `backend/test-data-sample.json`

包含 2 个示例工单,可用于快速测试导入功能:

```bash
npm run import-kb test-data-sample.json
```

## 下一步计划 (阶段 2)

1. **AI 集成**: 修改 AI 服务,在回答用户问题前先搜索知识库
2. **上下文处理**: 实现多轮对话上下文提取和传递
3. **相似度搜索**: 可选使用向量数据库提高搜索准确度
4. **前端展示**: 在回复中显示参考的历史工单 (可选)

## 性能优化建议

### 当前实现
- 适用于 160MB JSON 文件
- 批量插入,每 100 条日志
- 索引优化查询性能

### 未来优化 (如需要)
- 使用事务批量提交 (减少数据库往返)
- 并行处理工单导入
- 使用 PostgreSQL COPY 命令加速导入
- 添加全文搜索索引 (GIN 索引)
- 实现向量搜索 (pgvector) 提高语义匹配

## 文件清单

### 新增文件
- `backend/src/modules/knowledge-base/entities/kb-ticket.entity.ts`
- `backend/src/modules/knowledge-base/entities/kb-reply.entity.ts`
- `backend/src/modules/knowledge-base/dto/import-kb-data.dto.ts`
- `backend/src/modules/knowledge-base/knowledge-base.controller.ts`
- `backend/src/modules/knowledge-base/knowledge-base.service.ts`
- `backend/src/modules/knowledge-base/knowledge-base.module.ts`
- `backend/src/modules/knowledge-base/README.md`
- `backend/src/scripts/import-kb-data.ts`
- `backend/test-data-sample.json`
- `PHASE1-DATA-PREPARATION.md` (本文档)

### 修改文件
- `backend/src/app.module.ts`: 添加 KnowledgeBaseModule
- `backend/package.json`: 添加 `import-kb` 脚本

## 注意事项

1. **HTML 内容**: 回复内容包含 HTML 标签,前端需要安全处理显示
2. **数据大小**: 160MB JSON 文件导入可能需要 3-5 分钟
3. **数据库连接**: 确保 DATABASE_URL 配置正确
4. **清空数据**: `--clear` 参数会删除所有数据,生产环境慎用
5. **并发**: 导入时建议停止应用服务,避免并发冲突

## 总结

阶段 1 完成了数据准备的所有基础工作:
- ✅ 数据库 schema 设计
- ✅ 实体和关系定义
- ✅ 数据导入工具
- ✅ REST API 接口
- ✅ 搜索和查询功能
- ✅ 文档和测试数据

系统现在可以:
1. 导入历史客服数据
2. 按关键词搜索相关工单
3. 获取完整的工单对话历史
4. 为后续 AI 集成提供数据支持
