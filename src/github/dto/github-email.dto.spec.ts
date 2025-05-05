import { GitHubEmailDto, GitHubEmailsResponseDto } from './github-email.dto';

describe('GitHubEmailDto', () => {
  it('should create a valid GitHub email dto with public visibility', () => {
    const emailDto: GitHubEmailDto = {
      email: 'user@example.com',
      primary: true,
      verified: true,
      visibility: 'public',
    };

    expect(emailDto).toBeDefined();
    expect(emailDto.email).toBe('user@example.com');
    expect(emailDto.primary).toBe(true);
    expect(emailDto.verified).toBe(true);
    expect(emailDto.visibility).toBe('public');
  });

  it('should create a valid GitHub email dto with private visibility', () => {
    const emailDto: GitHubEmailDto = {
      email: 'user@example.com',
      primary: false,
      verified: true,
      visibility: 'private',
    };

    expect(emailDto).toBeDefined();
    expect(emailDto.email).toBe('user@example.com');
    expect(emailDto.primary).toBe(false);
    expect(emailDto.verified).toBe(true);
    expect(emailDto.visibility).toBe('private');
  });

  it('should create a valid GitHub email dto with null visibility', () => {
    const emailDto: GitHubEmailDto = {
      email: 'user@example.com',
      primary: false,
      verified: false,
      visibility: null,
    };

    expect(emailDto).toBeDefined();
    expect(emailDto.email).toBe('user@example.com');
    expect(emailDto.primary).toBe(false);
    expect(emailDto.verified).toBe(false);
    expect(emailDto.visibility).toBeNull();
  });

  it('should allow serialization to JSON', () => {
    const emailDto: GitHubEmailDto = {
      email: 'user@example.com',
      primary: true,
      verified: true,
      visibility: 'public',
    };

    const serialized = JSON.stringify(emailDto);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual({
      email: 'user@example.com',
      primary: true,
      verified: true,
      visibility: 'public',
    });
  });
});

describe('GitHubEmailsResponseDto', () => {
  it('should create a valid GitHub emails response dto', () => {
    const emailDto1: GitHubEmailDto = {
      email: 'primary@example.com',
      primary: true,
      verified: true,
      visibility: 'public',
    };

    const emailDto2: GitHubEmailDto = {
      email: 'secondary@example.com',
      primary: false,
      verified: true,
      visibility: 'private',
    };

    const response: GitHubEmailsResponseDto = {
      emails: [emailDto1, emailDto2],
    };

    expect(response).toBeDefined();
    expect(response.emails).toHaveLength(2);
    expect(response.emails[0]).toEqual(emailDto1);
    expect(response.emails[1]).toEqual(emailDto2);
  });

  it('should allow serialization to JSON', () => {
    const emailDto1: GitHubEmailDto = {
      email: 'primary@example.com',
      primary: true,
      verified: true,
      visibility: 'public',
    };

    const emailDto2: GitHubEmailDto = {
      email: 'secondary@example.com',
      primary: false,
      verified: false,
      visibility: null,
    };

    const response: GitHubEmailsResponseDto = {
      emails: [emailDto1, emailDto2],
    };

    const serialized = JSON.stringify(response);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual({
      emails: [
        {
          email: 'primary@example.com',
          primary: true,
          verified: true,
          visibility: 'public',
        },
        {
          email: 'secondary@example.com',
          primary: false,
          verified: false,
          visibility: null,
        },
      ],
    });
  });
});
