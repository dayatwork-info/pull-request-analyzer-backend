import { Injectable, HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GitHubService {
  private readonly apiUrl = 'https://api.github.com';
  
  private getAuthHeaders(token: string) {
    if (!token) {
      throw new UnauthorizedException('GitHub token is required');
    }
    
    return {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    };
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
}