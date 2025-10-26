import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [KnowledgeModule, RagModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
