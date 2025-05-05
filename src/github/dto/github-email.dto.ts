/**
 * GitHub Email DTO based on the GitHub REST API
 * Reference: https://docs.github.com/en/rest/users/emails#list-email-addresses-for-the-authenticated-user
 */
export interface GitHubEmailDto {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: 'public' | 'private' | null;
}

export interface GitHubEmailsResponseDto {
  emails: GitHubEmailDto[];
}
