import { validate } from 'class-validator';
import {
  DecryptCredentialsDto,
  DecryptedCredentialsResponseDto,
} from './decrypt-credentials.dto';

describe('DecryptCredentialsDto', () => {
  it('should validate a valid decrypt credentials dto', async () => {
    const decryptDto = new DecryptCredentialsDto();
    decryptDto.encryptedEmail = 'encrypted-email-data';
    decryptDto.encryptedPassword = 'encrypted-password-data';

    const errors = await validate(decryptDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with empty encrypted email', async () => {
    const decryptDto = new DecryptCredentialsDto();
    decryptDto.encryptedEmail = '';
    decryptDto.encryptedPassword = 'encrypted-password-data';

    const errors = await validate(decryptDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('encryptedEmail');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with empty encrypted password', async () => {
    const decryptDto = new DecryptCredentialsDto();
    decryptDto.encryptedEmail = 'encrypted-email-data';
    decryptDto.encryptedPassword = '';

    const errors = await validate(decryptDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('encryptedPassword');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with missing fields', async () => {
    const decryptDto = new DecryptCredentialsDto();
    // Not setting any properties

    const errors = await validate(decryptDto);
    expect(errors.length).toBe(2);
    expect(errors.map((e) => e.property)).toContain('encryptedEmail');
    expect(errors.map((e) => e.property)).toContain('encryptedPassword');
  });
});

describe('DecryptedCredentialsResponseDto', () => {
  it('should create a valid decrypted credentials response', () => {
    const response = new DecryptedCredentialsResponseDto();
    response.email = 'user@example.com';
    response.password = 'decrypted-password';

    expect(response).toBeDefined();
    expect(response.email).toBe('user@example.com');
    expect(response.password).toBe('decrypted-password');
  });

  it('should allow serialization to JSON', () => {
    const response = new DecryptedCredentialsResponseDto();
    response.email = 'user@example.com';
    response.password = 'decrypted-password';

    const serialized = JSON.stringify(response);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual({
      email: 'user@example.com',
      password: 'decrypted-password',
    });
  });
});
