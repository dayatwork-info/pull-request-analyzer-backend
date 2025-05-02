import { Controller, Get, Headers, Query } from '@nestjs/common';
import { GitHubService } from './github.service';

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
}