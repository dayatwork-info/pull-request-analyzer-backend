// No need for NestJS testing utilities in this unit test
import { ConfigService } from '@nestjs/config';
import { CryptoUtil } from './crypto.util';
import * as crypto from 'crypto';

// Mock crypto module
jest.mock('crypto', () => ({
  randomBytes: jest.fn().mockReturnValue(Buffer.from('1234567890123456')),
  scryptSync: jest
    .fn()
    .mockReturnValue(Buffer.from('mock-encryption-key'.padEnd(32, '0'))),
  createCipheriv: jest.fn(),
  createDecipheriv: jest.fn(),
}));

describe('CryptoUtil', () => {
  let configService: ConfigService;

  beforeEach(async () => {
    // Create mock config service
    configService = {
      get: jest.fn().mockReturnValue('test-encryption-key'),
    } as any;

    // Initialize CryptoUtil with the mock config service
    CryptoUtil.setConfigService(configService);

    // Reset key cache for each test
    (CryptoUtil as any).keyCache = undefined;

    // Mock cipher and decipher
    const mockCipher = {
      update: jest.fn().mockReturnValue('mockEncryptedData'),
      final: jest.fn().mockReturnValue('mockFinalData'),
    };

    const mockDecipher = {
      update: jest.fn().mockReturnValue('mockDecryptedData'),
      final: jest.fn().mockReturnValue('mockFinalData'),
    };

    (crypto.createCipheriv as jest.Mock).mockReturnValue(mockCipher);
    (crypto.createDecipheriv as jest.Mock).mockReturnValue(mockDecipher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setConfigService', () => {
    it('should set the config service', () => {
      // Test that the config service is set correctly
      expect((CryptoUtil as any).configService).toBe(configService);
    });
  });

  describe('getKey', () => {
    it('should create and cache the encryption key', () => {
      // First call should create and cache the key
      const key = (CryptoUtil as any).getKey();

      // Verify scryptSync was called
      expect(crypto.scryptSync).toHaveBeenCalledWith(
        'test-encryption-key',
        'salt',
        32,
      );

      // Verify key was cached
      expect((CryptoUtil as any).keyCache).toBe(key);

      // Second call should use cached key
      const cachedKey = (CryptoUtil as any).getKey();

      // Verify a second call to getKey returns the cached value
      expect(cachedKey).toBe(key);
    });

    it('should throw an error if encryption key is not set', () => {
      // Mock config service to return undefined
      (configService.get as jest.Mock).mockReturnValueOnce(undefined);

      // Reset key cache
      (CryptoUtil as any).keyCache = undefined;

      // Calling getKey should throw an error
      expect(() => (CryptoUtil as any).getKey()).toThrow(
        'Encryption key is not set in environment variables',
      );
    });
  });

  describe('encrypt', () => {
    it('should encrypt data correctly', () => {
      const text = 'test data';
      const result = CryptoUtil.encrypt(text);

      // Verify randomBytes was called for IV
      expect(crypto.randomBytes).toHaveBeenCalledWith(16);

      // Verify cipher was created with correct parameters
      expect(crypto.createCipheriv).toHaveBeenCalledWith(
        'aes-256-cbc',
        expect.any(Buffer),
        expect.any(Buffer),
      );

      // Verify cipher update and final were called
      const mockCipher = (crypto.createCipheriv as jest.Mock).mock.results[0]
        .value;
      expect(mockCipher.update).toHaveBeenCalledWith(text, 'utf8', 'base64');
      expect(mockCipher.final).toHaveBeenCalledWith('base64');

      // Verify result format (IV:encrypted)
      expect(result).toBe(
        'MTIzNDU2Nzg5MDEyMzQ1Ng==:mockEncryptedDatamockFinalData',
      );
    });
  });

  describe('decrypt', () => {
    it('should decrypt data correctly', () => {
      const encryptedText = 'MTIzNDU2Nzg5MDEyMzQ1Ng==:encryptedData';
      const result = CryptoUtil.decrypt(encryptedText);

      // Verify IV was extracted correctly
      const iv = Buffer.from('MTIzNDU2Nzg5MDEyMzQ1Ng==', 'base64');

      // Verify decipher was created with correct parameters
      expect(crypto.createDecipheriv).toHaveBeenCalledWith(
        'aes-256-cbc',
        expect.any(Buffer),
        iv,
      );

      // Verify decipher update and final were called
      const mockDecipher = (crypto.createDecipheriv as jest.Mock).mock
        .results[0].value;
      expect(mockDecipher.update).toHaveBeenCalledWith(
        'encryptedData',
        'base64',
        'utf8',
      );
      expect(mockDecipher.final).toHaveBeenCalledWith('utf8');

      // Verify result
      expect(result).toBe('mockDecryptedDatamockFinalData');
    });

    it('should throw an error if input format is invalid', () => {
      const invalidEncryptedText = 'invalid-format';

      // Mock update to throw an error
      const mockDecipher = {
        update: jest.fn().mockImplementation(() => {
          throw new Error('Invalid input');
        }),
        final: jest.fn(),
      };
      (crypto.createDecipheriv as jest.Mock).mockReturnValue(mockDecipher);

      // Calling decrypt with invalid input should throw
      expect(() => CryptoUtil.decrypt(invalidEncryptedText)).toThrow();
    });
  });
});
