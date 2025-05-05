import { validate } from 'class-validator';
import { RefreshTokenDto } from './refresh-token.dto';

describe('RefreshTokenDto', () => {
  it('should validate a valid refresh token', async () => {
    const refreshTokenDto = new RefreshTokenDto();
    refreshTokenDto.refreshToken = 'valid-refresh-token-123';

    const errors = await validate(refreshTokenDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with empty refresh token', async () => {
    const refreshTokenDto = new RefreshTokenDto();
    refreshTokenDto.refreshToken = '';

    const errors = await validate(refreshTokenDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('refreshToken');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with non-string refresh token', async () => {
    const refreshTokenDto = new RefreshTokenDto();
    // @ts-ignore - testing invalid type scenario
    refreshTokenDto.refreshToken = 12345;

    const errors = await validate(refreshTokenDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('refreshToken');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation with missing refresh token', async () => {
    const refreshTokenDto = new RefreshTokenDto();
    // Not setting the refreshToken property

    const errors = await validate(refreshTokenDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('refreshToken');
  });
});
