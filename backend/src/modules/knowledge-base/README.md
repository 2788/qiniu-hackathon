# 知识库模块 (Knowledge Base Module)

## 概述

知识库模块用于存储和管理历史人工客服数据,为智能客服系统提供参考案例。

## 数据结构

### 工单表 (kb_tickets)
- `id`: UUID 主键
- `original_id`: 原始工单 ID
- `title`: 工单标题
- `description`: 工单描述
- `category`: 分类(如"对象存储｜其他类咨询")
- `created_at`: 创建时间

### 回复表 (kb_replies)
- `id`: UUID 主键
- `ticket_id`: 关联工单 ID
- `owner`: 回复者类型(customer/agent)
- `content`: 回复内容
- `sequence_order`: 回复顺序
- `created_at`: 创建时间

## API 接口

### 导入数据
```
POST /knowledge-base/import
Body: { "tickets": [...] }
```

### 从文件导入
```
POST /knowledge-base/import-from-file
Body: { "filePath": "/path/to/data.json" }
```

### 搜索工单
```
GET /knowledge-base/search?q=关键词&category=分类&limit=10
```

### 获取工单详情
```
GET /knowledge-base/tickets/:id
```

### 清空数据
```
DELETE /knowledge-base/clear
```

## 使用 CLI 导入数据

```bash
# 导入数据
npm run import-kb /path/to/customer-service-data.json

# 清空现有数据并导入
npm run import-kb /path/to/customer-service-data.json -- --clear
```

## 数据格式示例

```json
[
  {
    "id": 397413,
    "title": "现在SSL证书是不能通过云存储做文件验证了么?",
    "description": "将附件(文件验证)传到了云存储下...",
    "category": "对象存储｜其他类咨询",
    "replies": [
      {
        "content": "<p>用户问题内容</p>",
        "owner": "customer"
      },
      {
        "content": "<p>客服回复内容</p>",
        "owner": "agent"
      }
    ]
  }
]
```

## 注意事项

1. 数据导入是批量操作,建议在非高峰期进行
2. 大文件(160MB+)导入可能需要几分钟时间
3. 回复内容可能包含 HTML 标签,需要前端处理显示
4. 使用 `--clear` 参数会删除所有现有数据,请谨慎使用
