import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('should validate a valid login dto', async () => {
    const loginDto = new LoginDto();
    loginDto.email = 'test@example.com';
    loginDto.password = 'password123';

    const errors = await validate(loginDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid email', async () => {
    const loginDto = new LoginDto();
    loginDto.email = 'invalid-email';
    loginDto.password = 'password123';

    const errors = await validate(loginDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail validation with empty email', async () => {
    const loginDto = new LoginDto();
    loginDto.email = '';
    loginDto.password = 'password123';

    const errors = await validate(loginDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with short password', async () => {
    const loginDto = new LoginDto();
    loginDto.email = 'test@example.com';
    loginDto.password = '12345'; // Less than 6 characters

    const errors = await validate(loginDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail validation with empty password', async () => {
    const loginDto = new LoginDto();
    loginDto.email = 'test@example.com';
    loginDto.password = '';

    const errors = await validate(loginDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
