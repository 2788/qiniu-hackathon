import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RagService } from '../src/modules/rag/rag.service';

function htmlToText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<img[^>]*>/gi, '[图片]')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .trim();
}

async function importData() {
  const dataFilePath = path.join(__dirname, '../data/customer-service.json');

  if (!fs.existsSync(dataFilePath)) {
    console.error(`数据文件不存在: ${dataFilePath}`);
    console.log('请将客服数据 JSON 文件放置到 backend/data/customer-service.json');
    process.exit(1);
  }

  console.log('读取数据文件...');
  const rawData = fs.readFileSync(dataFilePath, 'utf-8');
  const tickets = JSON.parse(rawData);
  console.log(`读取到 ${tickets.length} 条客服记录`);

  console.log('初始化应用...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const ragService = app.get(RagService);

  console.log('开始导入数据到向量数据库...');
  let successCount = 0;
  let errorCount = 0;

  const batchSize = 100;
  for (let i = 0; i < tickets.length; i += batchSize) {
    const batch = tickets.slice(i, i + batchSize);

    try {
      const processedBatch = batch.map((ticket: any) => ({
        id: ticket.id,
        title: htmlToText(ticket.title),
        description: htmlToText(ticket.description),
        category: ticket.category,
        replies: ticket.replies.map((reply: any) => ({
          content: htmlToText(reply.content),
          owner: reply.owner,
        })),
      }));

      await ragService.addDocuments(processedBatch);

      successCount += batch.length;
      console.log(`已导入 ${Math.min(i + batchSize, tickets.length)}/${tickets.length} 条记录...`);
    } catch (error) {
      errorCount += batch.length;
      console.error(`导入批次 ${i}-${i + batchSize} 失败:`, error);
    }
  }

  console.log(`\n导入完成!`);
  console.log(`成功: ${successCount} 条`);
  console.log(`失败: ${errorCount} 条`);
  console.log(`总计: ${tickets.length} 条`);

  await app.close();
  console.log('应用已关闭');
}

importData().catch((error) => {
  console.error('导入失败:', error);
  process.exit(1);
});
