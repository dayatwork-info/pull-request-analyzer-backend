import {
  Controller,
  Get,
  Headers,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { GitHubService } from './github.service';
import { RepositoryParamsDto } from './dto/repository-params.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('github')
@UseGuards(JwtAuthGuard) // Protect all routes with JWT authentication
export class GitHubController {
  constructor(private readonly gitHubService: GitHubService) {}

  // Note: We're using JWT for authenticating users to our system,
  // but we still need the GitHub token from headers to access GitHub API

  @Get('user')
  async getUserDetails(
    @Headers('X-GitHub-Token') customGithubToken: string,
    @CurrentUser() user: any,
  ) {
    return this.gitHubService.getUserDetails(customGithubToken);
  }

  @Get('user/emails')
  async getUserEmails(
    @Headers('X-GitHub-Token') customGithubToken: string,
    @CurrentUser() user: any,
  ) {
    return this.gitHubService.getUserEmails(customGithubToken);
  }

  @Get('repositories')
  async getRepositories(
    @Headers('X-GitHub-Token') customGithubToken: string,
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    return this.gitHubService.getRepositories(customGithubToken, page, perPage);
  }

  @Get('repos/:owner/:repo/pulls')
  async getPullRequests(
    @Headers('X-GitHub-Token') customGithubToken: string,
    @CurrentUser() user: any,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('state') state?: string,
  ) {
    const params: RepositoryParamsDto = {
      owner,
      repo,
      page,
      perPage,
      state,
    };
    return this.gitHubService.getPullRequests(customGithubToken, params);
  }

  @Get('repos/:owner/:repo/pulls/:pull_number')
  async getPullRequestDetails(
    @Headers('X-GitHub-Token') customGithubToken: string,
    @CurrentUser() user: any,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('pull_number') pullNumber: number,
    @Query('skip_summary') skipSummary?: boolean,
  ) {
    const params: RepositoryParamsDto = {
      owner,
      repo,
      skipSummary,
    };
    return this.gitHubService.getPullRequestDetails(
      customGithubToken,
      params,
      pullNumber,
    );
  }

  @Get('repos/:owner/:repo/pulls/:pull_number/contributors')
  async getPullRequestContributors(
    @Headers('X-GitHub-Token') customGithubToken: string,
    @CurrentUser() user: any,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('pull_number') pullNumber: number,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    const params: RepositoryParamsDto = {
      owner,
      repo,
      page,
      perPage,
    };
    return this.gitHubService.getPullRequestContributors(
      customGithubToken,
      params,
      pullNumber,
    );
  }

  @Get('repos/:owner/:repo/contributors')
  async getRepositoryContributors(
    @Headers('X-GitHub-Token') customGithubToken: string,
    @CurrentUser() user: any,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    const params: RepositoryParamsDto = {
      owner,
      repo,
      page,
      perPage,
    };
    return this.gitHubService.getRepositoryContributors(
      customGithubToken,
      params,
    );
  }
}
