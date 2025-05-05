import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AuthModule } from './auth/auth.module';
import { GitHubModule } from './github/github.module';
import { AnthropicModule } from './anthropic/anthropic.module';
import { JournalModule } from './journal/journal.module';
import { getConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: getConfig(),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('app.database.uri'),
        dbName: configService.get<string>('app.database.name'),
        connectionFactory: (connection: Connection) => {
          connection.on('connected', () => {
            console.log('MongoDB connected successfully');
          });
          connection.on('error', (error: Error) => {
            console.error('MongoDB connection error:', error);
          });
          return connection;
        },
      }),
    }),
    AuthModule,
    GitHubModule,
    AnthropicModule,
    JournalModule,
  ],
})
export class AppModule {}
