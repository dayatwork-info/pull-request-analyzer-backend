import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoUtil {
  private static algorithm = 'aes-256-cbc';
  private static configService: ConfigService;
  private static keyCache: Buffer;

  /**
   * Set the config service (should be called from the module's init)
   */
  static setConfigService(configService: ConfigService): void {
    this.configService = configService;
  }

  /**
   * Get encryption key (with caching)
   */
  private static getKey(): Buffer {
    if (!this.keyCache) {
      const encryptionKey = this.configService.get<string>(
        'app.auth.encryptionKey',
      );

      // Use non-null assertion as we always have a default value
      this.keyCache = crypto.scryptSync(encryptionKey!, 'salt', 32);
    }
    return this.keyCache;
  }

  /**
   * Encrypt data using symmetric key
   */
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.getKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    return `${iv.toString('base64')}:${encrypted}`;
  }

  /**
   * Decrypt data using symmetric key
   */
  static decrypt(encryptedText: string): string {
    const [ivBase64, encryptedData] = encryptedText.split(':');
    const iv = Buffer.from(ivBase64, 'base64');
    const decipher = crypto.createDecipheriv(this.algorithm, this.getKey(), iv);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
