import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class PullRequestSummaryRequestDto {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class PullRequestSummaryDto {
  @IsString()
  organization: string;

  @IsString()
  repository: string;

  @IsNumber()
  pullRequestNumber: number;

  @IsString()
  pullRequestTitle: string;

  @IsNumber()
  githubUserId: number;

  @IsString()
  githubUsername: string;

  @IsString()
  @IsOptional()
  summary: string;
}

export class OrganizationRepoDto {
  @IsString()
  organization: string;

  @IsString()
  repository: string;
}

export class PullRequestSummariesResponseDto {
  @IsBoolean()
  found: boolean;

  @IsNumber()
  summaries: number;
}
