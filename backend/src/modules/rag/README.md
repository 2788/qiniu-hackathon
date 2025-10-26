# RAG 模块

基于 LangChain 和 Chroma 的 RAG（检索增强生成）实现，用于智能客服系统。

## 概述

RAG 模块提供了一种使用向量数据库进行语义搜索的知识检索方案。与传统的关键词匹配相比，RAG 能够更好地理解用户问题的语义，检索出更相关的历史案例。

## 技术栈

- **LangChain**: 用于构建 RAG 应用的框架
- **Chroma**: 向量数据库，用于存储和检索文档向量
- **OpenAI Embeddings**: 使用 OpenAI 的 embedding 模型进行文本向量化

## 模块结构

```
rag/
├── rag.service.ts       # RAG 核心服务，负责向量存储和检索
├── rag-ai.service.ts    # RAG AI 服务，集成 OpenAI 和检索功能
├── rag.module.ts        # RAG 模块定义
└── README.md           # 本文档
```

## 使用方法

### 1. 启动 Chroma 服务

RAG 模块需要 Chroma 向量数据库服务。可以使用 Docker 启动：

```bash
docker run -d -p 8000:8000 chromadb/chroma
```

或者在 `.env` 文件中配置自定义 Chroma 地址：

```bash
CHROMA_URL=http://localhost:8000
```

### 2. 导入知识数据

将客服数据 JSON 文件放置到 `backend/data/customer-service.json`，然后运行：

```bash
npm run import-knowledge-rag
```

该脚本会：
1. 读取客服数据文件
2. 将每条客服记录转换为文档
3. 使用 OpenAI embeddings 进行向量化
4. 存储到 Chroma 向量数据库

### 3. 使用 RAG 服务

在其他模块中注入 `RagService` 或 `RagAiService`：

```typescript
import { RagService } from '../rag/rag.service';

@Injectable()
export class YourService {
  constructor(private ragService: RagService) {}

  async search(query: string) {
    const results = await this.ragService.searchRelevant(query, 3);
    return results;
  }
}
```

或直接使用 `RagAiService` 进行对话：

```typescript
import { RagAiService } from '../rag/rag-ai.service';

@Injectable()
export class YourService {
  constructor(private ragAiService: RagAiService) {}

  async chat(messages: ChatMessage[], model: string) {
    return await this.ragAiService.generateResponse(messages, model);
  }
}
```

## API 说明

### RagService

#### `searchRelevant(query: string, limit?: number): Promise<Document[]>`

根据查询语句检索相关文档。

- **参数**:
  - `query`: 用户查询
  - `limit`: 返回结果数量（默认 3）
- **返回**: 相关文档数组

#### `formatAsContext(documents: Document[]): string`

将检索到的文档格式化为上下文字符串。

- **参数**: 文档数组
- **返回**: 格式化后的上下文文本

#### `addDocuments(knowledgeData: KnowledgeDocument[]): Promise<void>`

批量添加文档到向量数据库。

- **参数**: 知识文档数组

### RagAiService

#### `generateResponse(messages: ChatMessage[], model: string): Promise<string>`

生成 AI 回复（非流式）。

- **参数**:
  - `messages`: 对话消息数组
  - `model`: OpenAI 模型名称
- **返回**: AI 回复文本

#### `generateResponseStream(messages: ChatMessage[], model: string): AsyncGenerator<string>`

生成流式 AI 回复。

- **参数**:
  - `messages`: 对话消息数组
  - `model`: OpenAI 模型名称
- **返回**: 异步生成器，逐块返回回复内容

## 与现有实现的对比

### 现有实现（knowledge 模块）

- 使用 PostgreSQL 存储
- 基于关键词数组匹配
- 简单快速，但语义理解能力有限

### RAG 实现

- 使用 Chroma 向量数据库
- 基于语义相似度检索
- 更准确理解用户意图，但需要额外的向量数据库服务

## 环境变量

```bash
CHROMA_URL=http://localhost:8000
```

## 注意事项

1. 首次使用前必须启动 Chroma 服务
2. 需要导入数据后才能进行检索
3. 向量化过程会调用 OpenAI API，请确保 API Key 配置正确
4. 大量数据导入可能需要较长时间和一定的 API 调用成本

## 后续优化建议

1. 添加向量数据库持久化配置
2. 实现增量更新机制
3. 支持多种 embedding 模型
4. 添加缓存机制减少 API 调用
5. 实现混合检索（向量检索 + 关键词检索）
