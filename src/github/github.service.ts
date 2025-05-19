import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
  Inject,
  forwardRef,
  BadRequestException,
} from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RepositoryParamsDto } from './dto/repository-params.dto';
import { PullRequestContributorsDto } from './dto/contributor.dto';
import { RepositoryContributorsDto } from './dto/repo-contributors.dto';
import {
  GitHubEmailDto,
  GitHubEmailsResponseDto,
} from './dto/github-email.dto';
import { GitHubUserDto } from './dto/github-user.dto';
import {
  GitHubPullRequestDto,
  GitHubPullRequestFileDto,
  GitHubPullRequestDetailDto,
  GitHubContributorDto,
  GitHubCommitDto,
} from './dto/github-pull-request.dto';
import {
  OrganizationRepoDto,
  PullRequestSummariesResponseDto,
  PullRequestSummaryRequestDto,
} from './dto/pull-request-summary.dto';
import {
  PullRequestSummary,
  PullRequestSummaryDocument,
} from './schemas/pull-request-summary.schema';
import { AnthropicService } from '../anthropic/anthropic.service';
import { JournalService } from '../journal/journal.service';
import { CreateJournalDto } from '../journal/dto/create-journal.dto';
import { User, UserDocument } from '../auth/schemas/user.schema';
import * as crypto from 'crypto';
import { CryptoUtil } from '../auth/utils/crypto.util';

@Injectable()
export class GitHubService {
  private readonly apiUrl: string;

  constructor(
    private configService: ConfigService,
    private anthropicService: AnthropicService,
    @Inject(forwardRef(() => JournalService))
    private journalService: JournalService,
    @InjectModel(PullRequestSummary.name)
    private pullRequestSummaryModel: Model<PullRequestSummaryDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
        patch: file.patch,
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

  /**
   * Fetch all pull requests for a specific organization and repository,
   * generate summaries for each, and store them in the database
   * @param token GitHub access token
   * @param params Organization and repository parameters
   * @param email Optional encrypted email for journal creation
   * @param password Optional encrypted password for journal creation
   * @returns Number of pull requests processed
   */
  async fetchAndSummarizePullRequests(
    token: string,
    params: OrganizationRepoDto,
    userDetails: PullRequestSummaryRequestDto,
  ): Promise<{
    processed: number;
    updated: number;
    skipped: number;
    journals: number;
  }> {
    try {
      const headers = this.getAuthHeaders(token);
      const { organization, repository } = params;

      const decryptedEmail = CryptoUtil.decrypt(userDetails.email);

      const user = await this.userModel
        .findOne({ email: decryptedEmail })
        .exec();

      if (!user) {
        throw new BadRequestException('Unable to find user');
      }

      let page = 1;
      const perPage = 30;
      let totalProcessed = 0;
      const totalUpdated = 0;
      const totalSkipped = 0;
      let totalJournals = 0;
      let hasMorePullRequests = true;

      // Get info about the current authenticated user
      const userResponse = await axios.get<GitHubUserDto>(
        `${this.apiUrl}/user`,
        {
          headers,
        },
      );
      const currentUser = userResponse.data;

      // Get user's email for creating journals
      const emailsResponse = await this.getUserEmails(token);

      const verifiedGithubEmails = emailsResponse.emails.filter(
        (e) => e.verified,
      );
      const isEmailVerifiedOnGithub = verifiedGithubEmails.some(
        (e) => e.email.toLowerCase() === decryptedEmail.toLowerCase(),
      );

      if (!isEmailVerifiedOnGithub) {
        throw new BadRequestException(
          'Email is not verified on GitHub. Please use a verified GitHub email.',
        );
      }

      while (hasMorePullRequests) {
        // Fetch a page of pull requests
        const prResponse = await axios.get<GitHubPullRequestDto[]>(
          `${this.apiUrl}/repos/${organization}/${repository}/pulls`,
          {
            headers,
            params: {
              state: 'all', // Get all pull requests (open, closed, merged)
              page,
              per_page: perPage,
              sort: 'created',
              direction: 'desc',
            },
          },
        );

        const pullRequests = prResponse.data;

        // If we got fewer PRs than the page size, this is the last page
        if (pullRequests.length < perPage) {
          hasMorePullRequests = false;
        }

        // Process each pull request
        for (const pr of pullRequests) {
          // Format the PR reference for storage
          const prRef = `${organization}_${repository}_${pr.number}`;

          const { found } = await this.journalService.getJournalByPrRef(
            user._id.toString(),
            prRef,
          );
          if (found) {
            continue;
          }

          const existingPrOfUser = await this.pullRequestSummaryModel.findOne({
            githubUserId: currentUser.id,
            organization,
            repository,
            pullRequestNumber: pr.number,
          });

          try {
            let savedPrId: string;
            let prSummary: string;

            if (existingPrOfUser) {
              savedPrId = existingPrOfUser._id.toString();
              prSummary = existingPrOfUser.summary;
            } else {
              // Fetch PR file changes
              const filesResponse = await axios.get<GitHubPullRequestFileDto[]>(
                `${this.apiUrl}/repos/${organization}/${repository}/pulls/${pr.number}/files`,
                { headers },
              );

              const files = filesResponse.data;

              // Generate summary using Anthropic
              const summary = await this.generateFilesSummary(files);

              // Create or update the pull request summary in the database
              const prSummaryData = {
                organization,
                repository,
                pullRequestNumber: pr.number,
                pullRequestTitle: pr.title,
                githubUserId: pr.user.id,
                githubUsername: pr.user.login,
                pullRequestSummary: summary,
                updatedAt: pr.updated_at,
              };

              prSummary = summary;

              // Create new record
              const newPr =
                await this.pullRequestSummaryModel.create(prSummaryData);
              savedPrId = newPr._id.toString();
              totalProcessed++;
            }
            // If this PR was created by the current authenticated user, create a journal entry
            if (currentUser.id === pr.user.id) {
              try {
                // Create a journal entry
                const journalDto: CreateJournalDto = {
                  email: userDetails.email,
                  password: userDetails.password,
                  title: pr.title,
                  content: prSummary,
                  prRef: prRef,
                };

                const { journalId: createdJournalId } =
                  await this.journalService.createJournal(journalDto, token);

                const hashedPrRef = crypto
                  .createHash('sha256')
                  .update(prRef)
                  .digest('hex');

                await this.userModel.findByIdAndUpdate(
                  user._id,
                  {
                    $set: {
                      [`prJournalMap.${hashedPrRef}`]: createdJournalId,
                    } as Record<string, unknown>,
                  },
                  { new: true },
                );
                totalJournals++;
                await this.pullRequestSummaryModel.deleteOne({
                  _id: savedPrId,
                });
              } catch (journalError) {
                console.error(
                  `Error creating journal for PR #${pr.number}:`,
                  journalError.message || journalError,
                );
                // Continue processing PRs even if journal creation fails
              }
            }
          } catch (prError) {
            console.error(`Error processing PR #${pr.number}:`, prError);
            // Continue with the next PR even if one fails
          }
        }

        page++;
      }

      return {
        processed: totalProcessed,
        updated: totalUpdated,
        skipped: totalSkipped,
        journals: totalJournals,
      };
    } catch (error) {
      if (error.response) {
        const errorMessage =
          (error.response.message as string) || 'GitHub API error';
        const statusCode =
          (error.response.status as number) || HttpStatus.BAD_REQUEST;
        throw new HttpException(errorMessage, statusCode);
      }
      throw new HttpException(
        'Failed to fetch and summarize pull requests',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Has pull request summaries for a specific GitHub user
   * @param githubUserId GitHub user ID
   * @returns Pull request summaries status
   */
  async hasUserPullRequestSummaries(
    token: string,
  ): Promise<PullRequestSummariesResponseDto> {
    try {
      // Get GitHub user details from token
      const userDetails = (await this.getUserDetails(token)) as GitHubUserDto;

      // Get the user ID from the response
      const githubUserId = userDetails.id;

      // Count total matching documents for pagination
      const totalCount = await this.pullRequestSummaryModel.countDocuments({
        githubUserId,
      });

      return {
        summaries: totalCount,
        found: totalCount > 0,
      };
    } catch (error) {
      console.error('error checking pull request summaries', error);
      throw new HttpException(
        'Failed to fetch user pull request summaries',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a pull request summary and add it to the work journal
   * @param token GitHub token
   * @param userDetails The data needed to create the pull request summary
   * @returns Result of the operation
   */
  async addPullRequestSummaries(
    token: string,
    userDetails: PullRequestSummaryRequestDto,
  ) {
    try {
      // Get GitHub user details from token
      const githubUserDetails = (await this.getUserDetails(
        token,
      )) as GitHubUserDto;
      const githubUserId = githubUserDetails.id;

      // Get pull request summaries from the model
      const prSummaries = await this.pullRequestSummaryModel.find({
        githubUserId,
      });

      if (!prSummaries) {
        throw new BadRequestException('No pull request summary found for user');
      }

      const decryptedEmail = CryptoUtil.decrypt(userDetails.email);

      const user = await this.userModel
        .findOne({ email: decryptedEmail })
        .exec();

      if (!user) {
        throw new BadRequestException('Unable to find user');
      }

      // Create a journal entry using the journal service
      for (const prSummary of prSummaries) {
        try {
          // Construct the PR reference
          const prRef = `${prSummary.organization}_${prSummary.repository}_${prSummary.pullRequestNumber}`;

          // Create a journal entry
          const journalDto: CreateJournalDto = {
            email: userDetails.email,
            password: userDetails.password,
            title: prSummary.pullRequestTitle,
            content: prSummary.summary,
            prRef: prRef,
          };

          const { journalId: createdJournalId } =
            await this.journalService.createJournal(journalDto, token);

          // Create a hash of the PR reference for storage
          const hashedPrRef = crypto
            .createHash('sha256')
            .update(prRef)
            .digest('hex');

          // Update the user's PR journal map
          await this.userModel.findByIdAndUpdate(
            user._id,
            {
              $set: {
                [`prJournalMap.${hashedPrRef}`]: createdJournalId,
              } as Record<string, unknown>,
            },
            { new: true },
          );

          // Delete the summary after it's been added to the journal
          await this.pullRequestSummaryModel.deleteOne({
            _id: prSummary._id,
          });
        } catch (journalError) {
          console.error(
            `Error creating journal entry:`,
            journalError.message || journalError,
          );
        }
      }
      return {};
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error creating pull request summary:', error);
      throw new HttpException(
        'Failed to create pull request summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
