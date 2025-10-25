import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import databaseConfig, { typeOrmConfig } from './config/database.config';
import { SessionModule } from './modules/session/session.module';
import { MessageModule } from './modules/message/message.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    SessionModule,
    MessageModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
