import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './session.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    private aiService: AiService,
  ) {}

  async create(userId: string, createSessionDto: CreateSessionDto): Promise<Session> {
    const session = this.sessionRepository.create({
      userId,
      ...createSessionDto,
    });
    return this.sessionRepository.save(session);
  }

  async findAll(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id, userId },
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return session;
  }

  async update(
    id: string,
    userId: string,
    updateSessionDto: UpdateSessionDto,
  ): Promise<Session> {
    const session = await this.findOne(id, userId);
    Object.assign(session, updateSessionDto);
    return this.sessionRepository.save(session);
  }

  async remove(id: string, userId: string): Promise<void> {
    const session = await this.findOne(id, userId);
    await this.sessionRepository.remove(session);
  }

  async updateLastMessageAt(id: string): Promise<void> {
    await this.sessionRepository.update(id, {
      lastMessageAt: new Date(),
    });
  }

  async generateTitle(id: string, userId: string, firstMessage: string): Promise<Session> {
    const session = await this.findOne(id, userId);
    const title = await this.aiService.generateTitle(firstMessage, session.model);
    session.title = title;
    return this.sessionRepository.save(session);
  }
}
