import { validate } from 'class-validator';
import { GitHubTokenDto } from './github-token.dto';

describe('GitHubTokenDto', () => {
  it('should validate a valid GitHub token', async () => {
    const tokenDto = new GitHubTokenDto();
    tokenDto.token = 'github_pat_valid_token123';

    const errors = await validate(tokenDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with empty token', async () => {
    const tokenDto = new GitHubTokenDto();
    tokenDto.token = '';

    const errors = await validate(tokenDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('token');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with non-string token', async () => {
    const tokenDto = new GitHubTokenDto();
    // @ts-ignore - testing invalid type scenario
    tokenDto.token = 12345;

    const errors = await validate(tokenDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('token');
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  it('should fail validation with missing token', async () => {
    const tokenDto = new GitHubTokenDto();
    // Not setting the token property

    const errors = await validate(tokenDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('token');
  });
});
