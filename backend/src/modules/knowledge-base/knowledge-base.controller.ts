import {
  Controller,
  Post,
  Get,
  Query,
  Param,
  Delete,
  Body,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';
import { KbTicketDto } from './dto/import-kb-data.dto';
import * as fs from 'fs/promises';
import * as path from 'path';

@Controller('knowledge-base')
export class KnowledgeBaseController {
  private readonly logger = new Logger(KnowledgeBaseController.name);

  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Post('import')
  @HttpCode(HttpStatus.OK)
  async importData(@Body() data: { tickets: KbTicketDto[] }) {
    this.logger.log(`Received import request with ${data.tickets.length} tickets`);
    await this.knowledgeBaseService.importData(data.tickets);
    return {
      success: true,
      message: `Successfully imported ${data.tickets.length} tickets`,
    };
  }

  @Post('import-from-file')
  @HttpCode(HttpStatus.OK)
  async importFromFile(@Body() data: { filePath: string }) {
    this.logger.log(`Importing data from file: ${data.filePath}`);

    const absolutePath = path.isAbsolute(data.filePath)
      ? data.filePath
      : path.join(process.cwd(), data.filePath);

    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    const tickets = JSON.parse(fileContent) as KbTicketDto[];

    await this.knowledgeBaseService.importData(tickets);

    return {
      success: true,
      message: `Successfully imported ${tickets.length} tickets from file`,
    };
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('category') category?: string,
    @Query('limit') limit?: string,
  ) {
    const tickets = await this.knowledgeBaseService.searchTickets(
      query,
      category,
      limit ? parseInt(limit, 10) : 10,
    );

    return {
      success: true,
      data: tickets,
      total: tickets.length,
    };
  }

  @Get('tickets/:id')
  async getTicket(@Param('id') id: string) {
    const ticket = await this.knowledgeBaseService.getTicketWithReplies(id);

    return {
      success: true,
      data: ticket,
    };
  }

  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  async clearData() {
    await this.knowledgeBaseService.clearAllData();
    return {
      success: true,
      message: 'All knowledge base data cleared',
    };
  }
}
