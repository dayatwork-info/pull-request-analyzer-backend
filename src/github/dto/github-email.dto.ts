export class GithubEmailDto {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export class GithubEmailsResponseDto {
  emails: GithubEmailDto[];
}
