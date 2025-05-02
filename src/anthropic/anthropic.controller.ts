import { Controller, Post, Body } from '@nestjs/common';
import { AnthropicService } from './anthropic.service';

@Controller('anthropic')
export class AnthropicController {
  constructor(private readonly anthropicService: AnthropicService) {}

  @Post('prompt')
  async promptAnthropic(@Body() body: { prompt: string }) {
    return this.anthropicService.createMessage(body.prompt);
  }
}