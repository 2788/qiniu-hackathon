import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { KnowledgeModule } from '../knowledge/knowledge.module';

@Module({
  imports: [KnowledgeModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
