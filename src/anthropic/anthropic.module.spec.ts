import { Test } from '@nestjs/testing';
import { AnthropicModule } from './anthropic.module';
import { AnthropicService } from './anthropic.service';
import { ConfigModule } from '@nestjs/config';

// Mock the Anthropic client
jest.mock('@anthropic-ai/sdk', () => {
  return {
    Anthropic: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn(),
      },
    })),
  };
});

describe('AnthropicModule', () => {
  let anthopicModule: AnthropicModule;
  let anthropicService: AnthropicService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          // Use a mock configuration for testing
          load: [
            () => ({
              app: {
                anthropic: {
                  apiKey: 'test-api-key',
                  modelName: 'test-model',
                  maxTokens: 500,
                },
              },
            }),
          ],
        }),
        AnthropicModule,
      ],
    }).compile();

    anthopicModule = moduleRef.get<AnthropicModule>(AnthropicModule);
    anthropicService = moduleRef.get<AnthropicService>(AnthropicService);
  });

  it('should be defined', () => {
    expect(anthopicModule).toBeDefined();
  });

  it('should provide AnthropicService', () => {
    expect(anthropicService).toBeDefined();
  });
});
