import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { KnowledgeBaseModule } from '../knowledge-base/knowledge-base.module';

@Module({
  imports: [KnowledgeBaseModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
