# 客服数据目录

## 使用说明

请将客服数据 JSON 文件放置到此目录下,命名为 `customer-service.json`。

## 数据格式

JSON 文件应包含客服工单数组,每个工单的格式如下:

```json
[
  {
    "id": 397413,
    "title": "问题标题",
    "description": "问题描述",
    "category": "问题分类",
    "replies": [
      {
        "content": "对话内容(可包含HTML)",
        "owner": "customer"
      },
      {
        "content": "客服回复",
        "owner": "agent"
      }
    ]
  }
]
```

## 导入数据

运行以下命令导入数据:

```bash
npm run import-knowledge
```
