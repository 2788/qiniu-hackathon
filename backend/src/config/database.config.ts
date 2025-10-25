import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Session } from '../modules/session/session.entity';
import { Message } from '../modules/message/message.entity';

export default () => ({
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT!, 10) || 5432,
    username: process.env.DATABASE_USER || 'user',
    password: process.env.DATABASE_PASSWORD || 'pass',
    database: process.env.DATABASE_NAME || 'chatbot',
  },
});

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT!, 10) || 5432,
  username: process.env.DATABASE_USER || 'user',
  password: process.env.DATABASE_PASSWORD || 'pass',
  database: process.env.DATABASE_NAME || 'chatbot',
  entities: [Session, Message],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
};
