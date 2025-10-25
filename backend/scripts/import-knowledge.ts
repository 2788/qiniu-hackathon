import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';
import { KnowledgeBase } from '../src/modules/knowledge/knowledge.entity';

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

function extractKeywords(text: string): string[] {
  if (!text) return [];
  return text
    .split(/[\s,。!?、]+/)
    .filter((word) => word.length >= 2)
    .slice(0, 20);
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

  console.log('连接数据库...');
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'chatbot',
    password: process.env.DATABASE_PASSWORD || 'chatbot',
    database: process.env.DATABASE_NAME || 'chatbot',
    entities: [KnowledgeBase],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('数据库连接成功');

  const repo = dataSource.getRepository(KnowledgeBase);

  console.log('清空现有知识库数据...');
  await repo.clear();

  console.log('开始导入数据...');
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < tickets.length; i++) {
    const ticket = tickets[i];

    try {
      const conversation = ticket.replies.map((reply: any) => ({
        role: reply.owner === 'customer' ? 'user' : 'assistant',
        content: htmlToText(reply.content),
      }));

      const titleText = htmlToText(ticket.title);
      const descText = htmlToText(ticket.description);
      const keywords = extractKeywords(titleText + ' ' + descText);

      await repo.save({
        ticketId: ticket.id,
        title: titleText,
        description: descText,
        category: ticket.category,
        conversation,
        keywords,
      });

      successCount++;

      if ((i + 1) % 100 === 0) {
        console.log(`已导入 ${i + 1}/${tickets.length} 条记录...`);
      }
    } catch (error) {
      errorCount++;
      console.error(`导入工单 ${ticket.id} 失败:`, error);
    }
  }

  console.log(`\n导入完成!`);
  console.log(`成功: ${successCount} 条`);
  console.log(`失败: ${errorCount} 条`);
  console.log(`总计: ${tickets.length} 条`);

  await dataSource.destroy();
  console.log('数据库连接已关闭');
}

importData().catch((error) => {
  console.error('导入失败:', error);
  process.exit(1);
});
