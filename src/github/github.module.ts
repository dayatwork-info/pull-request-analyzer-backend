import { Module } from '@nestjs/common';
import { GitHubController } from './github.controller';
import { GitHubService } from './github.service';
import { AnthropicModule } from '../anthropic/anthropic.module';

@Module({
  imports: [AnthropicModule],
  controllers: [GitHubController],
  providers: [GitHubService],
  exports: [GitHubService],
})
export class GitHubModule {}