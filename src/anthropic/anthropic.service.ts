import { Injectable } from '@nestjs/common';
import { Anthropic } from '@anthropic-ai/sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AnthropicService {
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    this.anthropic = new Anthropic({
      apiKey: this.configService.get<string>('app.anthropic.apiKey'),
    });
  }

  async createMessage(prompt: string) {
    // Get model from config
    const model = this.configService.get<string>(
      'app.anthropic.modelName',
    ) as string;
    // Get max tokens from config
    const maxTokens = this.configService.get<number>(
      'app.anthropic.maxTokens',
    ) as number;

    const response = await this.anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return response;
  }
}
