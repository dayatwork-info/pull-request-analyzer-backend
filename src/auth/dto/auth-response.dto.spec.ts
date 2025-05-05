import { AuthResponseDto } from './auth-response.dto';

describe('AuthResponseDto', () => {
  it('should create a valid auth response with required fields', () => {
    const authResponse = new AuthResponseDto();
    authResponse.accessToken = 'mock-access-token';
    authResponse.refreshToken = 'mock-refresh-token';
    authResponse.user = {
      id: 'user-123',
      email: 'user@example.com',
      isVerified: true,
    };

    expect(authResponse).toBeDefined();
    expect(authResponse.accessToken).toBe('mock-access-token');
    expect(authResponse.refreshToken).toBe('mock-refresh-token');
    expect(authResponse.user).toBeDefined();
    expect(authResponse.user.id).toBe('user-123');
    expect(authResponse.user.email).toBe('user@example.com');
    expect(authResponse.user.isVerified).toBe(true);
    expect(authResponse.encryptedCredentials).toBeUndefined();
  });

  it('should create a valid auth response with encrypted credentials', () => {
    const authResponse = new AuthResponseDto();
    authResponse.accessToken = 'mock-access-token';
    authResponse.refreshToken = 'mock-refresh-token';
    authResponse.user = {
      id: 'user-123',
      email: 'user@example.com',
      isVerified: true,
    };
    authResponse.encryptedCredentials = {
      email: 'encrypted-email',
      password: 'encrypted-password',
    };

    expect(authResponse).toBeDefined();
    expect(authResponse.accessToken).toBe('mock-access-token');
    expect(authResponse.refreshToken).toBe('mock-refresh-token');
    expect(authResponse.user).toBeDefined();
    expect(authResponse.user.id).toBe('user-123');
    expect(authResponse.user.email).toBe('user@example.com');
    expect(authResponse.user.isVerified).toBe(true);
    expect(authResponse.encryptedCredentials).toBeDefined();
    expect(authResponse.encryptedCredentials.email).toBe('encrypted-email');
    expect(authResponse.encryptedCredentials.password).toBe(
      'encrypted-password',
    );
  });

  it('should allow serialization to JSON', () => {
    const authResponse = new AuthResponseDto();
    authResponse.accessToken = 'mock-access-token';
    authResponse.refreshToken = 'mock-refresh-token';
    authResponse.user = {
      id: 'user-123',
      email: 'user@example.com',
      isVerified: true,
    };

    const serialized = JSON.stringify(authResponse);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: 'user-123',
        email: 'user@example.com',
        isVerified: true,
      },
    });
  });
});
