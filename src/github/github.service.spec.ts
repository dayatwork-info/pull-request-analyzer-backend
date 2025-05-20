import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import {
  HttpException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { GitHubService } from './github.service';
import { AnthropicService } from '../anthropic/anthropic.service';
import { JournalService } from '../journal/journal.service';
import { getModelToken } from '@nestjs/mongoose';
import axios from 'axios';
import { RepositoryParamsDto } from './dto/repository-params.dto';
import {
  GitHubPullRequestDto,
  GitHubPullRequestFileDto,
  GitHubContributorDto,
} from './dto/github-pull-request.dto';
import { PullRequestSummary } from './schemas/pull-request-summary.schema';
import { User } from '../auth/schemas/user.schema';
import { GitHubUserDto } from './dto/github-user.dto';
import { CryptoUtil } from '../auth/utils/crypto.util';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GitHubService', () => {
  let service: GitHubService;
  let mockConfigService: Partial<ConfigService>;
  let mockAnthropicService: Partial<AnthropicService>;
  let mockJournalService: any;
  let mockPullRequestSummaryModel: any;
  let mockUserModel: any;
  const mockApiUrl = 'https://api.github.com';
  const mockToken = 'test-github-token';

  beforeEach(async () => {
    // Mock ConfigService
    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'app.github.apiUrl') {
          return mockApiUrl;
        }
        if (key === 'app.auth.encryptionKey') {
          return 'test-encryption-key';
        }
        return undefined;
      }),
    };

    // Set the config service for CryptoUtil
    CryptoUtil.setConfigService(mockConfigService as ConfigService);

    // Mock AnthropicService
    mockAnthropicService = {
      createMessage: jest.fn(),
    };

    // Mock models and services
    mockJournalService = {
      createJournal: jest.fn(),
      getJournalByPrRef: jest.fn(),
    };

    mockPullRequestSummaryModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      countDocuments: jest.fn(),
      create: jest.fn(),
      deleteOne: jest.fn(),
    };

    mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitHubService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AnthropicService,
          useValue: mockAnthropicService,
        },
        {
          provide: JournalService,
          useValue: mockJournalService,
        },
        {
          provide: getModelToken(PullRequestSummary.name),
          useValue: mockPullRequestSummaryModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<GitHubService>(GitHubService);

    // Reset mocks before each test
    jest.clearAllMocks();
    mockedAxios.get.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw an error if GitHub API URL is not set', () => {
    // Mock ConfigService to return undefined for API URL
    const localMockConfigService = {
      get: jest.fn().mockReturnValue(undefined),
    };

    // Create mock services and dependencies for constructor
    const mockJournalService = {
      createJournal: jest.fn(),
      getJournalByPrRef: jest.fn(),
    };

    const mockPullRequestSummaryModel = {
      find: jest.fn(),
      findOne: jest.fn(),
      countDocuments: jest.fn(),
      create: jest.fn(),
      deleteOne: jest.fn(),
    };

    const mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    // Expect service instantiation to throw an error
    expect(() => {
      new GitHubService(
        localMockConfigService as any,
        mockAnthropicService as any,
        mockJournalService as any,
        mockPullRequestSummaryModel as any,
        mockUserModel as any,
      );
    }).toThrow('GitHub API URL is not set in environment variables');
  });

  describe('getAuthHeaders', () => {
    it('should throw UnauthorizedException if token is not provided', () => {
      // Use any to access private method
      expect(() => (service as any).getAuthHeaders('')).toThrow(
        UnauthorizedException,
      );
    });

    it('should return correct headers with token', () => {
      const headers = (service as any).getAuthHeaders(mockToken);
      expect(headers).toEqual({
        Authorization: `token ${mockToken}`,
        Accept: 'application/vnd.github.v3+json',
      });
    });
  });

  describe('getUserDetails', () => {
    it('should fetch user details successfully', async () => {
      const mockUserData = { login: 'testuser', id: 123 };
      mockedAxios.get.mockResolvedValueOnce({ data: mockUserData });

      const result = await service.getUserDetails(mockToken);

      expect(mockedAxios.get).toHaveBeenCalledWith(`${mockApiUrl}/user`, {
        headers: expect.objectContaining({
          Authorization: `token ${mockToken}`,
        }),
      });
      expect(result).toEqual(mockUserData);
    });

    it('should throw HttpException with status code if API request fails', async () => {
      const errorMessage = 'Bad credentials';
      mockedAxios.get.mockRejectedValueOnce({
        response: {
          data: { message: errorMessage },
          status: 401,
        },
      });

      await expect(service.getUserDetails(mockToken)).rejects.toThrow(
        new HttpException(errorMessage, 401),
      );
    });

    it('should throw a general HttpException if error response is not structured', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getUserDetails(mockToken)).rejects.toThrow(
        new HttpException('Failed to fetch GitHub user details', 500),
      );
    });
  });

  describe('getRepositories', () => {
    it('should fetch repositories with default pagination', async () => {
      const mockRepos = [{ name: 'repo1' }, { name: 'repo2' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockRepos });

      const result = await service.getRepositories(mockToken);

      expect(mockedAxios.get).toHaveBeenCalledWith(`${mockApiUrl}/user/repos`, {
        headers: expect.any(Object),
        params: {
          page: 1,
          per_page: 30,
          sort: 'updated',
          direction: 'desc',
        },
      });
      expect(result).toEqual(mockRepos);
    });

    it('should fetch repositories with custom pagination', async () => {
      const mockRepos = [{ name: 'repo1' }];
      mockedAxios.get.mockResolvedValueOnce({ data: mockRepos });

      const page = 2;
      const perPage = 10;
      const result = await service.getRepositories(mockToken, page, perPage);

      expect(mockedAxios.get).toHaveBeenCalledWith(`${mockApiUrl}/user/repos`, {
        headers: expect.any(Object),
        params: {
          page,
          per_page: perPage,
          sort: 'updated',
          direction: 'desc',
        },
      });
      expect(result).toEqual(mockRepos);
    });
  });

  describe('getPullRequests', () => {
    it('should fetch pull requests with params', async () => {
      const mockPRs = [
        { number: 1, title: 'PR 1' },
        { number: 2, title: 'PR 2' },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockPRs });

      const params: RepositoryParamsDto = {
        owner: 'testowner',
        repo: 'testrepo',
        page: 1,
        perPage: 30,
        state: 'open',
      };

      const result = await service.getPullRequests(mockToken, params);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${mockApiUrl}/repos/testowner/testrepo/pulls`,
        {
          headers: expect.any(Object),
          params: {
            page: 1,
            per_page: 30,
            state: 'open',
            sort: 'updated',
            direction: 'desc',
          },
        },
      );
      expect(result).toEqual(mockPRs);
    });
  });

  describe('getPullRequestDetails', () => {
    it('should fetch PR details with files and summary', async () => {
      // Mock PR data
      const mockPR: Partial<GitHubPullRequestDto> = {
        number: 1,
        title: 'Test PR',
        body: 'PR description',
      };

      // Mock files data
      const mockFiles: GitHubPullRequestFileDto[] = [
        {
          sha: 'abc123',
          filename: 'src/test.js',
          status: 'modified',
          additions: 10,
          deletions: 5,
          changes: 15,
          blob_url: 'https://github.com/blob',
          raw_url: 'https://github.com/raw',
          contents_url: 'https://github.com/contents',
          patch: '@@ -1,5 +1,10 @@',
        },
      ];

      // Mock successful API responses
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockPR })
        .mockResolvedValueOnce({ data: mockFiles });

      // Mock Anthropic service to return a summary
      const mockSummary = 'This PR modifies JavaScript files.';
      (mockAnthropicService.createMessage as jest.Mock).mockResolvedValueOnce({
        content: [{ text: mockSummary }],
      });

      // Test parameters
      const params: RepositoryParamsDto = {
        owner: 'testowner',
        repo: 'testrepo',
      };

      // Call the method
      const result = await service.getPullRequestDetails(mockToken, params, 1);

      // Verify API calls
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        `${mockApiUrl}/repos/testowner/testrepo/pulls/1`,
        { headers: expect.any(Object) },
      );
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        2,
        `${mockApiUrl}/repos/testowner/testrepo/pulls/1/files`,
        { headers: expect.any(Object) },
      );

      // Verify Anthropic service was called
      expect(mockAnthropicService.createMessage).toHaveBeenCalledWith(
        expect.stringContaining('Analyze the following files'),
      );

      // Verify the result
      expect(result).toEqual({
        ...mockPR,
        files: mockFiles,
        prSummary: mockSummary,
      });
    });

    it('should skip summary generation when skipSummary is true', async () => {
      // Mock API responses
      const mockPR = { number: 1 };
      const mockFiles = [{ filename: 'test.js' }];
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockPR })
        .mockResolvedValueOnce({ data: mockFiles });

      // Test parameters with skipSummary true
      const params: RepositoryParamsDto = {
        owner: 'testowner',
        repo: 'testrepo',
        skipSummary: true,
      };

      // Call the method
      await service.getPullRequestDetails(mockToken, params, 1);

      // Verify Anthropic service was NOT called
      expect(mockAnthropicService.createMessage).not.toHaveBeenCalled();
    });
  });

  describe('generateFilesSummary', () => {
    it('should return default message for empty files array', async () => {
      const result = await (service as any).generateFilesSummary([]);
      expect(result).toBe('No files changed in this pull request.');
    });

    it('should call Anthropic service and return summary', async () => {
      // Mock files
      const mockFiles: GitHubPullRequestFileDto[] = [
        {
          sha: 'abc123',
          filename: 'src/test.js',
          status: 'modified',
          additions: 10,
          deletions: 5,
          changes: 15,
          blob_url: 'https://github.com/blob',
          raw_url: 'https://github.com/raw',
          contents_url: 'https://github.com/contents',
        },
      ];

      // Mock Anthropic response
      const mockSummary = 'This PR modifies JavaScript files.';
      (mockAnthropicService.createMessage as jest.Mock).mockResolvedValueOnce({
        content: [{ text: mockSummary }],
      });

      // Call the method
      const result = await (service as any).generateFilesSummary(mockFiles);

      // Verify Anthropic service was called
      expect(mockAnthropicService.createMessage).toHaveBeenCalledWith(
        expect.stringContaining('src/test.js'),
      );

      // Verify the result
      expect(result).toBe(mockSummary);
    });

    it('should handle errors during summary generation', async () => {
      // Mock files
      const mockFiles: GitHubPullRequestFileDto[] = [
        {
          sha: 'abc123',
          filename: 'src/test.js',
          status: 'modified',
          additions: 10,
          deletions: 5,
          changes: 15,
          blob_url: 'https://github.com/blob',
          raw_url: 'https://github.com/raw',
          contents_url: 'https://github.com/contents',
        },
      ];

      // Mock Anthropic service to throw an error
      (mockAnthropicService.createMessage as jest.Mock).mockRejectedValueOnce(
        new Error('API error'),
      );

      // Mock console.error
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Call the method
      const result = await (service as any).generateFilesSummary(mockFiles);

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error generating files summary:',
        expect.any(Error),
      );

      // Verify default error message was returned
      expect(result).toBe('Failed to generate summary of changed files.');

      // Restore console.error
      consoleSpy.mockRestore();
    });
  });

  describe('getPullRequestContributors', () => {
    it('should fetch PR contributors correctly', async () => {
      // Mock data
      const mockContributors: GitHubContributorDto[] = [
        {
          login: 'user1',
          id: 1,
          node_id: 'node1',
          avatar_url: 'avatar1',
          html_url: 'html1',
          contributions: 10,
          gravatar_id: '',
          url: '',
          followers_url: '',
          following_url: '',
          gists_url: '',
          starred_url: '',
          subscriptions_url: '',
          organizations_url: '',
          repos_url: '',
          events_url: '',
          received_events_url: '',
          type: 'User',
          site_admin: false,
        },
        {
          login: 'user2',
          id: 2,
          node_id: 'node2',
          avatar_url: 'avatar2',
          html_url: 'html2',
          contributions: 5,
          gravatar_id: '',
          url: '',
          followers_url: '',
          following_url: '',
          gists_url: '',
          starred_url: '',
          subscriptions_url: '',
          organizations_url: '',
          repos_url: '',
          events_url: '',
          received_events_url: '',
          type: 'User',
          site_admin: false,
        },
      ];

      const mockCommits = [
        { author: { login: 'user1' } },
        { author: { login: 'user2' } },
      ];

      // Mock API responses
      mockedAxios.get
        .mockResolvedValueOnce({
          data: mockContributors,
          headers: {
            link: '<https://api.github.com/repos/owner/repo/contributors?page=2>; rel="next", <https://api.github.com/repos/owner/repo/contributors?page=3>; rel="last"',
          },
        })
        .mockResolvedValueOnce({ data: mockCommits });

      // Test parameters
      const params: RepositoryParamsDto = {
        owner: 'testowner',
        repo: 'testrepo',
        page: 1,
        perPage: 30,
      };

      // Call the method
      const result = await service.getPullRequestContributors(
        mockToken,
        params,
        1,
      );

      // Verify API calls
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        1,
        `${mockApiUrl}/repos/testowner/testrepo/contributors`,
        {
          headers: expect.any(Object),
          params: {
            page: 1,
            per_page: 30,
            anon: 'false',
          },
        },
      );
      expect(mockedAxios.get).toHaveBeenNthCalledWith(
        2,
        `${mockApiUrl}/repos/testowner/testrepo/pulls/1/commits`,
        { headers: expect.any(Object) },
      );

      // Verify the result structure
      expect(result).toEqual({
        pull_number: 1,
        repository: 'testowner/testrepo',
        contributors: expect.arrayContaining([
          expect.objectContaining({ login: 'user1' }),
          expect.objectContaining({ login: 'user2' }),
        ]),
        pagination: expect.objectContaining({
          current_page: 1,
          per_page: 30,
        }),
      });
    });

    it('should filter contributors not related to the PR', async () => {
      // Mock data with more contributors than PR authors
      const mockContributors: GitHubContributorDto[] = [
        {
          login: 'user1',
          id: 1,
          contributions: 10,
          node_id: '',
          avatar_url: '',
          gravatar_id: '',
          url: '',
          html_url: '',
          followers_url: '',
          following_url: '',
          gists_url: '',
          starred_url: '',
          subscriptions_url: '',
          organizations_url: '',
          repos_url: '',
          events_url: '',
          received_events_url: '',
          type: '',
          site_admin: false,
        },
        {
          login: 'user2',
          id: 2,
          contributions: 5,
          node_id: '',
          avatar_url: '',
          gravatar_id: '',
          url: '',
          html_url: '',
          followers_url: '',
          following_url: '',
          gists_url: '',
          starred_url: '',
          subscriptions_url: '',
          organizations_url: '',
          repos_url: '',
          events_url: '',
          received_events_url: '',
          type: '',
          site_admin: false,
        },
        {
          login: 'user3',
          id: 3,
          contributions: 2,
          node_id: '',
          avatar_url: '',
          gravatar_id: '',
          url: '',
          html_url: '',
          followers_url: '',
          following_url: '',
          gists_url: '',
          starred_url: '',
          subscriptions_url: '',
          organizations_url: '',
          repos_url: '',
          events_url: '',
          received_events_url: '',
          type: '',
          site_admin: false,
        },
      ];

      // Only user1 contributed to the PR
      const mockCommits = [{ author: { login: 'user1' } }];

      // Mock API responses
      mockedAxios.get
        .mockResolvedValueOnce({ data: mockContributors, headers: {} })
        .mockResolvedValueOnce({ data: mockCommits });

      // Call the method
      const result = await service.getPullRequestContributors(
        mockToken,
        {
          owner: 'testowner',
          repo: 'testrepo',
        },
        1,
      );

      // Verify only user1 is included in the result
      expect(result.contributors).toHaveLength(1);
      expect(result.contributors[0].login).toBe('user1');
    });
  });

  describe('getUserEmails', () => {
    it('should fetch user emails successfully', async () => {
      const mockEmails = [
        {
          email: 'test@example.com',
          primary: true,
          verified: true,
          visibility: 'public' as const,
        },
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: mockEmails });

      const result = await service.getUserEmails(mockToken);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${mockApiUrl}/user/emails`,
        {
          headers: expect.objectContaining({
            Authorization: `token ${mockToken}`,
          }),
        },
      );
      expect(result).toEqual({ emails: mockEmails });
    });
  });

  describe('addPullRequestSummaries', () => {
    const mockGithubUser = {
      id: 12345,
      login: 'testuser',
      email: 'test@example.com',
    } as GitHubUserDto;

    const mockPrSummaries = [
      {
        _id: 'pr1',
        organization: 'testorg',
        repository: 'testrepo',
        pullRequestNumber: 123,
        pullRequestTitle: 'Test PR 1',
        githubUserId: 12345,
        githubUsername: 'testuser',
        summary: 'This is a test PR summary',
      },
      {
        _id: 'pr2',
        organization: 'testorg',
        repository: 'testrepo',
        pullRequestNumber: 124,
        pullRequestTitle: 'Test PR 2',
        githubUserId: 12345,
        githubUsername: 'testuser',
        summary: 'This is another test PR summary',
      },
    ];

    const userDetailsDto = {
      email: 'encrypted-email',
      password: 'encrypted-password',
    };

    const mockUser = {
      _id: 'user1',
      email: 'test@example.com',
      github: {
        id: 12345,
      },
    };

    it('should add PR summaries to work journal', async () => {
      // Setup mocks
      mockedAxios.get.mockResolvedValueOnce({ data: mockGithubUser });
      mockPullRequestSummaryModel.find.mockResolvedValueOnce(mockPrSummaries);
      mockUserModel.findOne.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      }));
      mockJournalService.createJournal.mockResolvedValue({
        journalId: 'journal1',
      });
      mockUserModel.findByIdAndUpdate.mockResolvedValue(mockUser);
      mockPullRequestSummaryModel.deleteOne.mockResolvedValue({
        deletedCount: 1,
      });

      // Mock the CryptoUtil.decrypt
      const cryptoSpy = jest
        .spyOn(CryptoUtil, 'decrypt')
        .mockImplementation(() => 'test@example.com');

      const result = await service.addPullRequestSummaries(
        mockToken,
        userDetailsDto,
      );

      // Verify getUserDetails was called
      expect(mockedAxios.get).toHaveBeenCalledWith(`${mockApiUrl}/user`, {
        headers: expect.any(Object),
      });

      // Verify PR summaries were fetched
      expect(mockPullRequestSummaryModel.find).toHaveBeenCalledWith({
        githubUserId: mockGithubUser.id,
      });

      // Verify user was looked up
      expect(mockUserModel.findOne).toHaveBeenCalled();

      // Verify journal creation was called for each PR
      expect(mockJournalService.createJournal).toHaveBeenCalledTimes(2);

      // Verify PR summaries were deleted after journal creation
      expect(mockPullRequestSummaryModel.deleteOne).toHaveBeenCalledTimes(2);

      // Verify result is empty object
      expect(result).toEqual({});

      cryptoSpy.mockRestore();
    });

    it('should throw BadRequestException if no PR summaries found', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockGithubUser });
      mockPullRequestSummaryModel.find.mockResolvedValueOnce(null);

      await expect(
        service.addPullRequestSummaries(mockToken, userDetailsDto),
      ).rejects.toThrow(BadRequestException);

      expect(mockPullRequestSummaryModel.find).toHaveBeenCalledWith({
        githubUserId: mockGithubUser.id,
      });
    });

    it('should throw BadRequestException if user not found', async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockGithubUser });
      mockPullRequestSummaryModel.find.mockResolvedValueOnce(mockPrSummaries);

      // Mock the CryptoUtil.decrypt
      const cryptoSpy = jest
        .spyOn(CryptoUtil, 'decrypt')
        .mockImplementation(() => 'test@example.com');

      mockUserModel.findOne.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValueOnce(null),
      }));

      await expect(
        service.addPullRequestSummaries(mockToken, userDetailsDto),
      ).rejects.toThrow(BadRequestException);

      cryptoSpy.mockRestore();
    });
  });
});
