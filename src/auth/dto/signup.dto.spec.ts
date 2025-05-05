import { validate } from 'class-validator';
import { SignupDto } from './signup.dto';

describe('SignupDto', () => {
  it('should validate a valid signup dto', async () => {
    const signupDto = new SignupDto();
    signupDto.email = 'test@example.com';
    signupDto.password = 'password123';

    const errors = await validate(signupDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with invalid email', async () => {
    const signupDto = new SignupDto();
    signupDto.email = 'invalid-email';
    signupDto.password = 'password123';

    const errors = await validate(signupDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail validation with empty email', async () => {
    const signupDto = new SignupDto();
    signupDto.email = '';
    signupDto.password = 'password123';

    const errors = await validate(signupDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with short password', async () => {
    const signupDto = new SignupDto();
    signupDto.email = 'test@example.com';
    signupDto.password = '12345'; // Less than 6 characters

    const errors = await validate(signupDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail validation with empty password', async () => {
    const signupDto = new SignupDto();
    signupDto.email = 'test@example.com';
    signupDto.password = '';

    const errors = await validate(signupDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
