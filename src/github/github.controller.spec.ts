import { Test, TestingModule } from '@nestjs/testing';
import { GitHubController } from './github.controller';
import { GitHubService } from './github.service';
// RepositoryParamsDto is used in type assertions
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Create a mock JWT guard that allows all requests
const mockJwtAuthGuard = { canActivate: jest.fn(() => true) };

describe('GitHubController', () => {
  let controller: GitHubController;
  let mockGitHubService: Partial<GitHubService>;
  const mockGithubToken = 'test-github-token';

  beforeEach(async () => {
    // Create mock service with all methods used by the controller
    mockGitHubService = {
      getUserDetails: jest.fn(),
      getUserEmails: jest.fn(),
      getRepositories: jest.fn(),
      getPullRequests: jest.fn(),
      getPullRequestDetails: jest.fn(),
      getPullRequestContributors: jest.fn(),
      getRepositoryContributors: jest.fn(),
      hasUserPullRequestSummaries: jest.fn(),
      addPullRequestSummaries: jest.fn(),
      fetchAndSummarizePullRequests: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GitHubController],
      providers: [
        {
          provide: GitHubService,
          useValue: mockGitHubService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<GitHubController>(GitHubController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUserDetails', () => {
    it('should call service method with token', async () => {
      const mockUserData = { login: 'testuser', id: 123 };
      (mockGitHubService.getUserDetails as jest.Mock).mockResolvedValueOnce(
        mockUserData,
      );

      const result = await controller.getUserDetails(mockGithubToken);

      expect(mockGitHubService.getUserDetails).toHaveBeenCalledWith(
        mockGithubToken,
      );
      expect(result).toEqual(mockUserData);
    });
  });

  describe('getUserEmails', () => {
    it('should call service method with token', async () => {
      const mockEmailsData = {
        emails: [
          {
            email: 'test@example.com',
            primary: true,
            verified: true,
            visibility: 'public' as const,
          },
        ],
      };
      (mockGitHubService.getUserEmails as jest.Mock).mockResolvedValueOnce(
        mockEmailsData,
      );

      const result = await controller.getUserEmails(mockGithubToken);

      expect(mockGitHubService.getUserEmails).toHaveBeenCalledWith(
        mockGithubToken,
      );
      expect(result).toEqual(mockEmailsData);
    });
  });

  describe('getRepositories', () => {
    it('should call service method with token and pagination params', async () => {
      const mockRepos = [{ name: 'repo1' }, { name: 'repo2' }];
      (mockGitHubService.getRepositories as jest.Mock).mockResolvedValueOnce(
        mockRepos,
      );

      const page = 2;
      const perPage = 10;
      const result = await controller.getRepositories(
        mockGithubToken,
        page,
        perPage,
      );

      expect(mockGitHubService.getRepositories).toHaveBeenCalledWith(
        mockGithubToken,
        page,
        perPage,
      );
      expect(result).toEqual(mockRepos);
    });
  });

  describe('getPullRequests', () => {
    it('should call service method with token and repository params', async () => {
      const mockPRs = [{ number: 1, title: 'PR 1' }];
      (mockGitHubService.getPullRequests as jest.Mock).mockResolvedValueOnce(
        mockPRs,
      );

      const owner = 'testowner';
      const repo = 'testrepo';
      const page = 1;
      const perPage = 30;
      const state = 'open';

      const result = await controller.getPullRequests(
        mockGithubToken,
        owner,
        repo,
        page,
        perPage,
        state,
      );

      expect(mockGitHubService.getPullRequests).toHaveBeenCalledWith(
        mockGithubToken,
        expect.objectContaining({
          owner,
          repo,
          page,
          perPage,
          state,
        }),
      );
      expect(result).toEqual(mockPRs);
    });
  });

  describe('getPullRequestDetails', () => {
    it('should call service method with token, params, and pull number', async () => {
      const mockPRDetails = {
        number: 1,
        title: 'Test PR',
        files: [],
        prSummary: 'Test summary',
      };
      (
        mockGitHubService.getPullRequestDetails as jest.Mock
      ).mockResolvedValueOnce(mockPRDetails);

      const owner = 'testowner';
      const repo = 'testrepo';
      const pullNumber = 1;
      const skipSummary = true;

      const result = await controller.getPullRequestDetails(
        mockGithubToken,
        owner,
        repo,
        pullNumber,
        skipSummary,
      );

      expect(mockGitHubService.getPullRequestDetails).toHaveBeenCalledWith(
        mockGithubToken,
        expect.objectContaining({
          owner,
          repo,
          skipSummary,
        }),
        pullNumber,
      );
      expect(result).toEqual(mockPRDetails);
    });
  });

  describe('getPullRequestContributors', () => {
    it('should call service method with token, params, and pull number', async () => {
      const mockContributors = {
        pull_number: 1,
        repository: 'testowner/testrepo',
        contributors: [{ login: 'user1', contributions: 10 }],
        pagination: { current_page: 1, per_page: 30 },
      };
      (
        mockGitHubService.getPullRequestContributors as jest.Mock
      ).mockResolvedValueOnce(mockContributors);

      const owner = 'testowner';
      const repo = 'testrepo';
      const pullNumber = 1;
      const page = 1;
      const perPage = 30;

      const result = await controller.getPullRequestContributors(
        mockGithubToken,
        owner,
        repo,
        pullNumber,
        page,
        perPage,
      );

      expect(mockGitHubService.getPullRequestContributors).toHaveBeenCalledWith(
        mockGithubToken,
        expect.objectContaining({
          owner,
          repo,
          page,
          perPage,
        }),
        pullNumber,
      );
      expect(result).toEqual(mockContributors);
    });
  });

  describe('getRepositoryContributors', () => {
    it('should call service method with token and repository params', async () => {
      const mockContributors = {
        repository: 'testowner/testrepo',
        contributors: [{ login: 'user1', contributions: 10 }],
        pagination: { current_page: 1, per_page: 30 },
      };
      (
        mockGitHubService.getRepositoryContributors as jest.Mock
      ).mockResolvedValueOnce(mockContributors);

      const owner = 'testowner';
      const repo = 'testrepo';
      const page = 1;
      const perPage = 30;

      const result = await controller.getRepositoryContributors(
        mockGithubToken,
        owner,
        repo,
        page,
        perPage,
      );

      expect(mockGitHubService.getRepositoryContributors).toHaveBeenCalledWith(
        mockGithubToken,
        expect.objectContaining({
          owner,
          repo,
          page,
          perPage,
        }),
      );
      expect(result).toEqual(mockContributors);
    });
  });

  describe('hasUserPullRequestSummaries', () => {
    it('should call service method with token', async () => {
      const mockResponse = {
        found: true,
        summaries: 5,
      };
      (
        mockGitHubService.hasUserPullRequestSummaries as jest.Mock
      ).mockResolvedValueOnce(mockResponse);

      const result =
        await controller.hasUserPullRequestSummaries(mockGithubToken);

      expect(
        mockGitHubService.hasUserPullRequestSummaries,
      ).toHaveBeenCalledWith(mockGithubToken);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('addPullRequestSummaries', () => {
    it('should call service method with token and request dto', async () => {
      const requestDto = {
        email: 'encrypted-email',
        password: 'encrypted-password',
      };
      const mockResponse = {};

      (
        mockGitHubService.addPullRequestSummaries as jest.Mock
      ).mockResolvedValueOnce(mockResponse);

      const result = await controller.addPullRequestSummaries(
        mockGithubToken,
        requestDto,
      );

      expect(mockGitHubService.addPullRequestSummaries).toHaveBeenCalledWith(
        mockGithubToken,
        requestDto,
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
