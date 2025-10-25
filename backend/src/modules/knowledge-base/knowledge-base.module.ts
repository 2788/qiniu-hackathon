import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KnowledgeBaseController } from './knowledge-base.controller';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KbTicket } from './entities/kb-ticket.entity';
import { KbReply } from './entities/kb-reply.entity';

@Module({
  imports: [TypeOrmModule.forFeature([KbTicket, KbReply])],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
