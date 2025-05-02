import { Controller, Get, Headers, Query, Param } from '@nestjs/common';
import { GitHubService } from './github.service';
import { RepositoryParamsDto } from './dto/repository-params.dto';

@Controller('github')
export class GitHubController {
  constructor(private readonly gitHubService: GitHubService) {}

  @Get('user')
  async getUserDetails(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.gitHubService.getUserDetails(token);
  }

  @Get('repositories')
  async getRepositories(
    @Headers('authorization') authHeader: string,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    return this.gitHubService.getRepositories(token, page, perPage);
  }

  @Get('repos/:owner/:repo/pulls')
  async getPullRequests(
    @Headers('authorization') authHeader: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Query('page') page?: number,
    @Query('per_page') perPage?: number,
    @Query('state') state?: string,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    const params: RepositoryParamsDto = {
      owner,
      repo,
      page,
      perPage,
      state,
    };
    return this.gitHubService.getPullRequests(token, params);
  }

  @Get('repos/:owner/:repo/pulls/:pull_number')
  async getPullRequestDetails(
    @Headers('authorization') authHeader: string,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('pull_number') pullNumber: number,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    const params: RepositoryParamsDto = {
      owner,
      repo,
    };
    return this.gitHubService.getPullRequestDetails(token, params, pullNumber);
  }
}