export class ContributorDto {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export class PaginationMetaDto {
  current_page: number;
  per_page: number;
  total_contributors?: number;
}

export class PullRequestContributorsDto {
  pull_number: number;
  repository: string;
  contributors: ContributorDto[];
  pagination: PaginationMetaDto;
}