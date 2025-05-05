import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { RepositoryParamsDto } from './dto/repository-params.dto';
import { PullRequestContributorsDto } from './dto/contributor.dto';
import { RepositoryContributorsDto } from './dto/repo-contributors.dto';
import {
  GitHubEmailDto,
  GitHubEmailsResponseDto,
} from './dto/github-email.dto';
import {
  GitHubPullRequestDto,
  GitHubPullRequestFileDto,
  GitHubPullRequestDetailDto,
  GitHubContributorDto,
  GitHubCommitDto,
} from './dto/github-pull-request.dto';
import { AnthropicService } from '../anthropic/anthropic.service';

@Injectable()
export class GitHubService {
  private readonly apiUrl: string;

  constructor(
    private configService: ConfigService,
    private anthropicService: AnthropicService,
  ) {
    this.apiUrl = this.configService.get<string>('app.github.apiUrl') as string;

    if (!this.apiUrl) {
      throw new Error('GitHub API URL is not set in environment variables');
    }
  }

  private getAuthHeaders(token: string) {
    if (!token) {
      throw new UnauthorizedException('GitHub token is required');
    }

    return {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    };
  }

  private async generateFilesSummary(files: GitHubPullRequestFileDto[]) {
    try {
      if (!files || files.length === 0) {
        return 'No files changed in this pull request.';
      }

      // Create a condensed representation of the files for the prompt
      const fileDetails = files.map((file) => ({
        filename: file.filename,
        status: file.status, // added, modified, removed
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch?.substring(0, 500), // Limit patch size to avoid token limits
      }));

      const prompt = `
You are an expert code reviewer. Analyze the following files changed in a pull request and provide a concise summary:

${JSON.stringify(fileDetails, null, 2)}

Focus on:
1. What types of files were changed (frontend, backend, tests, configs, etc.)
2. The main components/systems affected
3. Notable patterns in the changes (e.g., "mostly adding new API endpoints" or "refactoring utility functions")
4. Potential impact areas

Keep your summary under 150 words and be specific about what was changed.
`;

      // Call Anthropic API
      const response = await this.anthropicService.createMessage(prompt);

      // Safely extract the text from the content block
      if (response.content && response.content.length > 0) {
        const contentBlock = response.content[0];
        // Check if it's a text block
        if ('text' in contentBlock) {
          return contentBlock.text;
        }
      }

      return 'Could not generate summary.';
    } catch (error) {
      console.error('Error generating files summary:', error);
      return 'Failed to generate summary of changed files.';
    }
  }

  async getUserDetails(token: string) {
    try {
      const headers = this.getAuthHeaders(token);
      const response = await axios.get(`${this.apiUrl}/user`, {
        headers,
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        const errorMessage =
          (error.response.data?.message as string) || 'GitHub API error';
        const statusCode =
          (error.response.status as number) || HttpStatus.BAD_REQUEST;
        throw new HttpException(errorMessage, statusCode);
      }
      throw new HttpException(
        'Failed to fetch GitHub user details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRepositories(token: string, page = 1, perPage = 30) {
    try {
      const headers = this.getAuthHeaders(token);
      const response = await axios.get(`${this.apiUrl}/user/repos`, {
        headers,
        params: {
          page,
          per_page: perPage,
          sort: 'updated',
          direction: 'desc',
        },
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        const errorMessage =
          (error.response.data?.message as string) || 'GitHub API error';
        const statusCode =
          (error.response.status as number) || HttpStatus.BAD_REQUEST;
        throw new HttpException(errorMessage, statusCode);
      }
      throw new HttpException(
        'Failed to fetch GitHub repositories',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPullRequests(token: string, params: RepositoryParamsDto) {
    try {
      const headers = this.getAuthHeaders(token);
      const { owner, repo, page = 1, perPage = 30, state = 'all' } = params;

      const response = await axios.get(
        `${this.apiUrl}/repos/${owner}/${repo}/pulls`,
        {
          headers,
          params: {
            page,
            per_page: perPage,
            state,
            sort: 'updated',
            direction: 'desc',
          },
        },
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        const errorMessage =
          (error.response.data?.message as string) || 'GitHub API error';
        const statusCode =
          (error.response.status as number) || HttpStatus.BAD_REQUEST;
        throw new HttpException(errorMessage, statusCode);
      }
      throw new HttpException(
        'Failed to fetch pull requests',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPullRequestDetails(
    token: string,
    params: RepositoryParamsDto,
    pullNumber: number,
  ): Promise<GitHubPullRequestDetailDto> {
    try {
      const headers = this.getAuthHeaders(token);
      const { owner, repo, skipSummary = false } = params;

      // Fetch pull request details
      const prResponse = await axios.get<GitHubPullRequestDto>(
        `${this.apiUrl}/repos/${owner}/${repo}/pulls/${pullNumber}`,
        {
          headers,
        },
      );

      // Fetch files changed in the pull request
      const filesResponse = await axios.get<GitHubPullRequestFileDto[]>(
        `${this.apiUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/files`,
        {
          headers,
        },
      );

      // Base response with PR and files data
      const response: GitHubPullRequestDetailDto = {
        ...prResponse.data,
        files: filesResponse.data,
      };

      // Generate summary of files changed only if not skipped
      if (!skipSummary) {
        const filesSummary = await this.generateFilesSummary(
          filesResponse.data,
        );
        response.prSummary = filesSummary;
      }

      return response;
    } catch (error) {
      if (error.response) {
        const errorMessage =
          (error.response.data?.message as string) || 'GitHub API error';
        const statusCode =
          (error.response.status as number) || HttpStatus.BAD_REQUEST;
        throw new HttpException(errorMessage, statusCode);
      }
      throw new HttpException(
        'Failed to fetch pull request details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPullRequestContributors(
    token: string,
    params: RepositoryParamsDto,
    pullNumber: number,
  ): Promise<PullRequestContributorsDto> {
    try {
      const headers = this.getAuthHeaders(token);
      const { owner, repo } = params;

      // Get all repository contributors using the dedicated endpoint
      const contributorsResponse = await axios.get<GitHubContributorDto[]>(
        `${this.apiUrl}/repos/${owner}/${repo}/contributors`,
        {
          headers,
          params: {
            page: params.page || 1,
            per_page: params.perPage || 30,
            anon: 'false', // Exclude anonymous contributors
          },
        },
      );

      // Get PR commits to identify active contributors relevant to this PR
      const commitsResponse = await axios.get<GitHubCommitDto[]>(
        `${this.apiUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/commits`,
        { headers },
      );

      // Extract commit authors to identify who's relevant to this PR
      const prAuthorLogins = new Set<string>();
      commitsResponse.data.forEach((commit: GitHubCommitDto) => {
        if (commit.author && commit.author.login) {
          prAuthorLogins.add(commit.author.login);
        }
      });

      // Filter and format contributors relevant to this PR
      const prContributors = contributorsResponse.data
        // Only include contributors who made commits to this PR
        .filter((contributor: GitHubContributorDto) =>
          prAuthorLogins.has(contributor.login),
        )
        // Map to our DTO format
        .map((contributor: GitHubContributorDto) => ({
          id: contributor.id,
          login: contributor.login,
          avatar_url: contributor.avatar_url,
          html_url: contributor.html_url,
          contributions: contributor.contributions,
        }))
        // Sort by contribution count (most active first)
        .sort((a, b) => b.contributions - a.contributions);

      // Extract pagination info from headers if available
      const linkHeader = contributorsResponse.headers.link as string;
      let totalContributors: number | undefined = undefined;

      // Extract the pagination info
      if (linkHeader) {
        // Try to parse total count from header
        const lastPageMatch = linkHeader.match(/&page=(\d+).*?rel="last"/);
        if (lastPageMatch && lastPageMatch[1]) {
          const lastPage = parseInt(lastPageMatch[1], 10);
          const perPage = params.perPage || 30;
          totalContributors = lastPage * perPage; // Approximate count
        }
      }

      return {
        pull_number: pullNumber,
        repository: `${owner}/${repo}`,
        contributors: prContributors,
        pagination: {
          current_page: params.page || 1,
          per_page: params.perPage || 30,
          total_contributors: totalContributors,
        },
      };
    } catch (error) {
      if (error.response) {
        const errorMessage =
          (error.response.data?.message as string) || 'GitHub API error';
        const statusCode =
          (error.response.status as number) || HttpStatus.BAD_REQUEST;
        throw new HttpException(errorMessage, statusCode);
      }
      throw new HttpException(
        'Failed to fetch pull request contributors',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getRepositoryContributors(
    token: string,
    params: RepositoryParamsDto,
  ): Promise<RepositoryContributorsDto> {
    try {
      const headers = this.getAuthHeaders(token);
      const { owner, repo, page = 1, perPage = 30 } = params;

      // Fetch repository contributors directly from GitHub API
      const contributorsResponse = await axios.get<GitHubContributorDto[]>(
        `${this.apiUrl}/repos/${owner}/${repo}/contributors`,
        {
          headers,
          params: {
            page,
            per_page: perPage,
            anon: 'false', // Exclude anonymous contributors
          },
        },
      );

      // Map the GitHub API response to our DTO format
      const contributors = contributorsResponse.data.map(
        (contributor: GitHubContributorDto) => ({
          id: contributor.id,
          login: contributor.login,
          avatar_url: contributor.avatar_url,
          html_url: contributor.html_url,
          contributions: contributor.contributions,
        }),
      );

      // Extract pagination info from headers if available
      const linkHeader = contributorsResponse.headers.link as string;
      let totalContributors: number | undefined = undefined;

      // Extract the pagination info
      if (linkHeader) {
        // Try to parse total count from header
        const lastPageMatch = linkHeader.match(/&page=(\d+).*?rel="last"/);
        if (lastPageMatch && lastPageMatch[1]) {
          const lastPage = parseInt(lastPageMatch[1], 10);
          totalContributors = lastPage * perPage; // Approximate count
        }
      }

      return {
        repository: `${owner}/${repo}`,
        contributors,
        pagination: {
          current_page: page,
          per_page: perPage,
          total_contributors: totalContributors,
        },
      };
    } catch (error) {
      if (error.response) {
        const errorMessage =
          (error.response.data?.message as string) || 'GitHub API error';
        const statusCode =
          (error.response.status as number) || HttpStatus.BAD_REQUEST;
        throw new HttpException(errorMessage, statusCode);
      }
      throw new HttpException(
        'Failed to fetch repository contributors',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get authenticated user's emails using the GitHub API
   * @param token GitHub access token
   * @returns List of user's email addresses
   */
  async getUserEmails(token: string): Promise<GitHubEmailsResponseDto> {
    try {
      const headers = this.getAuthHeaders(token);

      // Call the GitHub User Emails API endpoint
      const response = await axios.get<GitHubEmailDto[]>(
        `${this.apiUrl}/user/emails`,
        {
          headers,
        },
      );

      // GitHub API returns the array directly, so we wrap it in our response format
      const emails: GitHubEmailDto[] = response.data;

      return {
        emails,
      };
    } catch (error) {
      if (error.response) {
        const errorMessage =
          (error.response.data?.message as string) || 'GitHub API error';
        const statusCode =
          (error.response.status as number) || HttpStatus.BAD_REQUEST;
        throw new HttpException(errorMessage, statusCode);
      }
      throw new HttpException(
        'Failed to fetch GitHub user emails',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
