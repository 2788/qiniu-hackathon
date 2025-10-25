import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { KnowledgeBaseService } from '../modules/knowledge-base/knowledge-base.service';
import * as fs from 'fs/promises';
import * as path from 'path';

async function importKnowledgeBaseData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const knowledgeBaseService = app.get(KnowledgeBaseService);

  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Usage: npm run import-kb <path-to-json-file>');
    process.exit(1);
  }

  try {
    console.log(`Reading data from: ${filePath}`);
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);

    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    const tickets = JSON.parse(fileContent);

    console.log(`Found ${tickets.length} tickets to import`);

    const clearExisting = process.argv.includes('--clear');
    if (clearExisting) {
      console.log('Clearing existing data...');
      await knowledgeBaseService.clearAllData();
    }

    console.log('Starting import...');
    await knowledgeBaseService.importData(tickets);

    console.log('Import completed successfully');
    await app.close();
    process.exit(0);
  } catch (error) {
    console.error('Import failed:', error);
    await app.close();
    process.exit(1);
  }
}

importKnowledgeBaseData();
