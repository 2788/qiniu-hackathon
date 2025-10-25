import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { UserId } from '../../common/decorators/user-id.decorator';

@Controller('api/sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@UserId() userId: string, @Body() createSessionDto: CreateSessionDto) {
    return this.sessionService.create(userId, createSessionDto);
  }

  @Get()
  findAll(@UserId() userId: string) {
    return this.sessionService.findAll(userId);
  }

  @Get(':id')
  findOne(@UserId() userId: string, @Param('id') id: string) {
    return this.sessionService.findOne(id, userId);
  }

  @Put(':id')
  update(
    @UserId() userId: string,
    @Param('id') id: string,
    @Body() updateSessionDto: UpdateSessionDto,
  ) {
    return this.sessionService.update(id, userId, updateSessionDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@UserId() userId: string, @Param('id') id: string) {
    await this.sessionService.remove(id, userId);
  }
}
