import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { RepositoryParamsDto } from './dto/repository-params.dto';
import { AnthropicService } from '../anthropic/anthropic.service';

@Injectable()
export class GitHubService {
  private readonly apiUrl: string;
  
  constructor(
    private configService: ConfigService,
    private anthropicService: AnthropicService,
  ) {
    this.apiUrl = this.configService.get<string>('app.github.apiUrl') || 'https://api.github.com';
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
  
  private async generateFilesSummary(files: any[]) {
    try {
      if (!files || files.length === 0) {
        return 'No files changed in this pull request.';
      }
      
      // Create a condensed representation of the files for the prompt
      const fileDetails = files.map(file => ({
        filename: file.filename,
        status: file.status, // added, modified, removed
        additions: file.additions,
        deletions: file.deletions,
        changes: file.changes,
        patch: file.patch?.substring(0, 500) // Limit patch size to avoid token limits
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
        throw new HttpException(
          error.response.data.message || 'GitHub API error',
          error.response.status || HttpStatus.BAD_REQUEST,
        );
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
        throw new HttpException(
          error.response.data.message || 'GitHub API error',
          error.response.status || HttpStatus.BAD_REQUEST,
        );
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
        throw new HttpException(
          error.response.data.message || 'GitHub API error',
          error.response.status || HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Failed to fetch pull requests',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPullRequestDetails(token: string, params: RepositoryParamsDto, pullNumber: number) {
    try {
      const headers = this.getAuthHeaders(token);
      const { owner, repo } = params;
      
      // Fetch pull request details
      const prResponse = await axios.get(
        `${this.apiUrl}/repos/${owner}/${repo}/pulls/${pullNumber}`,
        {
          headers,
        },
      );
      
      // Fetch files changed in the pull request
      const filesResponse = await axios.get(
        `${this.apiUrl}/repos/${owner}/${repo}/pulls/${pullNumber}/files`,
        {
          headers,
        },
      );
      
      // Generate summary of files changed using Anthropic
      const filesSummary = await this.generateFilesSummary(filesResponse.data);
      
      // Return combined data with summary
      return {
        ...prResponse.data,
        files: filesResponse.data,
        prSummary: filesSummary,
      };
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.data.message || 'GitHub API error',
          error.response.status || HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Failed to fetch pull request details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}