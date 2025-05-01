import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GitHubService {
  private readonly apiUrl = 'https://api.github.com';

  async getUserDetails(token: string) {
    if (!token) {
      throw new UnauthorizedException('GitHub token is required');
    }

    try {
      const response = await axios.get(`${this.apiUrl}/user`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
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
        'Failed to fetch GitHub user details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}