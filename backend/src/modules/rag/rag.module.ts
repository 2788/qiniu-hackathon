import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagAiService } from './rag-ai.service';

@Module({
  providers: [RagService, RagAiService],
  exports: [RagService, RagAiService],
})
export class RagModule {}
