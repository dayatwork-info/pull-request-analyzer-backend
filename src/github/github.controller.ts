import { Controller, Get, Headers } from '@nestjs/common';
import { GitHubService } from './github.service';

@Controller('github')
export class GitHubController {
  constructor(private readonly gitHubService: GitHubService) {}

  @Get('user')
  async getUserDetails(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '');
    return this.gitHubService.getUserDetails(token);
  }
}