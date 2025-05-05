import { validate } from 'class-validator';
import { VerifyEmailDto } from './verify-email.dto';

describe('VerifyEmailDto', () => {
  it('should validate a valid verification token', async () => {
    const verifyEmailDto = new VerifyEmailDto();
    verifyEmailDto.verificationToken = 'valid-token-123';

    const errors = await validate(verifyEmailDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with empty token', async () => {
    const verifyEmailDto = new VerifyEmailDto();
    verifyEmailDto.verificationToken = '';

    const errors = await validate(verifyEmailDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('verificationToken');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with non-string token', async () => {
    const verifyEmailDto = new VerifyEmailDto();
    // @ts-ignore - testing invalid type scenario
    verifyEmailDto.verificationToken = 12345;

    const errors = await validate(verifyEmailDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('verificationToken');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation with missing token', async () => {
    const verifyEmailDto = new VerifyEmailDto();
    // Not setting the verificationToken property

    const errors = await validate(verifyEmailDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('verificationToken');
  });
});
