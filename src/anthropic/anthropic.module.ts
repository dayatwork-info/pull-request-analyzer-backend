import { Module } from '@nestjs/common';
import { AnthropicService } from './anthropic.service';
import { AnthropicController } from './anthropic.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [AnthropicController],
  providers: [AnthropicService],
  exports: [AnthropicService],
})
export class AnthropicModule {}