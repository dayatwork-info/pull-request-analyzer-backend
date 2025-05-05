import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { CryptoUtil } from './utils/crypto.util';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

// Test only the decryptCredentials method since it's the simplest and doesn't require complex mocking
describe('AuthService - Simple Tests', () => {
  let service: AuthService;

  beforeEach(async () => {
    // Create a very simple UserModel with just enough to instantiate the service
    const mockUserModel = {
      findOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
      findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
    };

    // Simple JWT service mock
    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-token'),
      verify: jest.fn(),
    };

    // Simple Config service mock
    const mockConfigService = {
      get: jest.fn().mockReturnValue('mock-value'),
    };

    // Create test module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Mock CryptoUtil methods
    jest.spyOn(CryptoUtil, 'encrypt').mockReturnValue('encrypted-data');
    jest.spyOn(CryptoUtil, 'decrypt').mockImplementation((data) => {
      if (data === 'encrypted-email') return 'test@example.com';
      if (data === 'encrypted-password') return 'password123';
      return 'decrypted-data';
    });
  });

  // The decryptCredentials method is relatively simple and doesn't depend on complex MongoDB operations
  describe('decryptCredentials', () => {
    it('should decrypt credentials successfully', () => {
      // Mock decrypt for email and password
      jest
        .spyOn(CryptoUtil, 'decrypt')
        .mockReturnValueOnce('test@example.com') // For email
        .mockReturnValueOnce('password123'); // For password

      // Call the method
      const result = service.decryptCredentials({
        encryptedEmail: 'encrypted-email',
        encryptedPassword: 'encrypted-password',
      });

      // Verify the result
      expect(result).toEqual({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should throw BadRequestException if credentials are missing', () => {
      // Missing password
      expect(() =>
        service.decryptCredentials({
          encryptedEmail: 'encrypted-email',
          encryptedPassword: '',
        }),
      ).toThrow(BadRequestException);

      // Missing email
      expect(() =>
        service.decryptCredentials({
          encryptedEmail: '',
          encryptedPassword: 'encrypted-password',
        }),
      ).toThrow(BadRequestException);
    });

    it('should handle decryption errors correctly', () => {
      // Mock a failure in the decrypt method
      jest.spyOn(CryptoUtil, 'decrypt').mockImplementationOnce(() => {
        throw new Error('Failed to decrypt');
      });

      // Test error handling
      expect(() =>
        service.decryptCredentials({
          encryptedEmail: 'invalid-encryption',
          encryptedPassword: 'password',
        }),
      ).toThrow(BadRequestException);
    });

    it('should catch and convert to InternalServerError for unexpected errors', () => {
      // Mock a more generic error
      jest.spyOn(CryptoUtil, 'decrypt').mockImplementationOnce(() => {
        throw new Error('Some other error');
      });

      // Valid email and password data
      const dto = {
        encryptedEmail: 'encrypted-email',
        encryptedPassword: 'encrypted-password',
      };

      // Should be converted to InternalServerErrorException
      expect(() => service.decryptCredentials(dto)).toThrow(
        InternalServerErrorException,
      );
    });
  });
});
