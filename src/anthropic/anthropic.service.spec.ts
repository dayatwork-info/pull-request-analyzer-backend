import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AnthropicService } from './anthropic.service';
import { Anthropic } from '@anthropic-ai/sdk';

// Mock the Anthropic client
jest.mock('@anthropic-ai/sdk', () => {
  return {
    Anthropic: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockImplementation(() => Promise.resolve({})),
      },
    })),
  };
});

describe('AnthropicService', () => {
  let service: AnthropicService;
  let mockConfigService: Partial<ConfigService>;
  let mockAnthropicClient: jest.Mocked<Anthropic>;

  beforeEach(async () => {
    // Mock values
    const apiKey = 'test-api-key';
    const modelName = 'claude-3-opus-20240229';
    const maxTokens = 1000;

    // Mock ConfigService
    mockConfigService = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'app.anthropic.apiKey':
            return apiKey;
          case 'app.anthropic.modelName':
            return modelName;
          case 'app.anthropic.maxTokens':
            return maxTokens;
          default:
            return undefined;
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnthropicService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AnthropicService>(AnthropicService);

    // Get the mocked Anthropic instance
    mockAnthropicClient = (service as any).anthropic;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an Anthropic instance with the API key from config', () => {
    // Check if Anthropic constructor was called with the correct API key
    expect(Anthropic).toHaveBeenCalledWith({
      apiKey: 'test-api-key',
    });
  });

  describe('createMessage', () => {
    it('should call the Anthropic messages.create method with correct parameters', async () => {
      // Mock the response from Anthropic
      const mockResponse = {
        id: 'msg_123456',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'Hello, this is a test response.',
          },
        ],
        model: 'claude-3-opus-20240229',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 10,
          output_tokens: 20,
        },
      };

      // Set up the mock to return our mockResponse
      (mockAnthropicClient.messages.create as jest.Mock).mockImplementation(
        () => Promise.resolve(mockResponse),
      );

      // Call the service method
      const prompt = 'Hello, this is a test prompt.';
      const result = await service.createMessage(prompt);

      // Check that the client was called with correct parameters
      expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-opus-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      // Check the returned response
      expect(result).toEqual(mockResponse);
    });

    it('should throw an error if the Anthropic API call fails', async () => {
      // Mock an API error
      const errorMessage = 'API Error';
      (mockAnthropicClient.messages.create as jest.Mock).mockImplementation(
        () => Promise.reject(new Error(errorMessage)),
      );

      // Call the service method and expect it to throw
      await expect(service.createMessage('test')).rejects.toThrow(errorMessage);
    });

    it('should get model and maxTokens from config service', async () => {
      // Mock a successful response
      (mockAnthropicClient.messages.create as jest.Mock).mockImplementation(
        () => Promise.resolve({}),
      );

      // Call the service method
      await service.createMessage('test prompt');

      // Verify that configService.get was called for both values
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'app.anthropic.modelName',
      );
      expect(mockConfigService.get).toHaveBeenCalledWith(
        'app.anthropic.maxTokens',
      );
    });
  });

  // Test edge cases
  describe('edge cases', () => {
    it('should handle empty prompt', async () => {
      // Mock a successful response
      (mockAnthropicClient.messages.create as jest.Mock).mockImplementation(
        () => Promise.resolve({}),
      );

      // Call with empty prompt
      await service.createMessage('');

      // Should still call the API with empty content
      expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: '' }],
        }),
      );
    });

    it('should handle very long prompts', async () => {
      // Create a very long prompt
      const longPrompt = 'a'.repeat(10000);

      // Mock a successful response
      (mockAnthropicClient.messages.create as jest.Mock).mockImplementation(
        () => Promise.resolve({}),
      );

      // Call with long prompt
      await service.createMessage(longPrompt);

      // Should pass the full prompt to the API
      expect(mockAnthropicClient.messages.create).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: [{ role: 'user', content: longPrompt }],
        }),
      );
    });
  });
});
