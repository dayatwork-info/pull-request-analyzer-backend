import {
  ContributorDto,
  PaginationMetaDto,
  PullRequestContributorsDto,
} from './contributor.dto';

describe('ContributorDto', () => {
  it('should create a valid contributor dto', () => {
    const contributor = new ContributorDto();
    contributor.id = 12345;
    contributor.login = 'octocat';
    contributor.avatar_url = 'https://github.com/images/avatar.png';
    contributor.html_url = 'https://github.com/octocat';
    contributor.contributions = 42;

    expect(contributor).toBeDefined();
    expect(contributor.id).toBe(12345);
    expect(contributor.login).toBe('octocat');
    expect(contributor.avatar_url).toBe('https://github.com/images/avatar.png');
    expect(contributor.html_url).toBe('https://github.com/octocat');
    expect(contributor.contributions).toBe(42);
  });

  it('should allow serialization to JSON', () => {
    const contributor = new ContributorDto();
    contributor.id = 12345;
    contributor.login = 'octocat';
    contributor.avatar_url = 'https://github.com/images/avatar.png';
    contributor.html_url = 'https://github.com/octocat';
    contributor.contributions = 42;

    const serialized = JSON.stringify(contributor);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual({
      id: 12345,
      login: 'octocat',
      avatar_url: 'https://github.com/images/avatar.png',
      html_url: 'https://github.com/octocat',
      contributions: 42,
    });
  });
});

describe('PaginationMetaDto', () => {
  it('should create a valid pagination meta dto without total', () => {
    const pagination = new PaginationMetaDto();
    pagination.current_page = 1;
    pagination.per_page = 30;

    expect(pagination).toBeDefined();
    expect(pagination.current_page).toBe(1);
    expect(pagination.per_page).toBe(30);
    expect(pagination.total_contributors).toBeUndefined();
  });

  it('should create a valid pagination meta dto with total', () => {
    const pagination = new PaginationMetaDto();
    pagination.current_page = 2;
    pagination.per_page = 20;
    pagination.total_contributors = 100;

    expect(pagination).toBeDefined();
    expect(pagination.current_page).toBe(2);
    expect(pagination.per_page).toBe(20);
    expect(pagination.total_contributors).toBe(100);
  });
});

describe('PullRequestContributorsDto', () => {
  it('should create a valid pull request contributors dto', () => {
    const contributor1 = new ContributorDto();
    contributor1.id = 12345;
    contributor1.login = 'octocat';
    contributor1.avatar_url = 'https://github.com/images/avatar1.png';
    contributor1.html_url = 'https://github.com/octocat';
    contributor1.contributions = 42;

    const contributor2 = new ContributorDto();
    contributor2.id = 67890;
    contributor2.login = 'octodog';
    contributor2.avatar_url = 'https://github.com/images/avatar2.png';
    contributor2.html_url = 'https://github.com/octodog';
    contributor2.contributions = 17;

    const pagination = new PaginationMetaDto();
    pagination.current_page = 1;
    pagination.per_page = 30;
    pagination.total_contributors = 2;

    const pullRequestContributors = new PullRequestContributorsDto();
    pullRequestContributors.pull_number = 123;
    pullRequestContributors.repository = 'owner/repo';
    pullRequestContributors.contributors = [contributor1, contributor2];
    pullRequestContributors.pagination = pagination;

    expect(pullRequestContributors).toBeDefined();
    expect(pullRequestContributors.pull_number).toBe(123);
    expect(pullRequestContributors.repository).toBe('owner/repo');
    expect(pullRequestContributors.contributors).toHaveLength(2);
    expect(pullRequestContributors.contributors[0]).toEqual(contributor1);
    expect(pullRequestContributors.contributors[1]).toEqual(contributor2);
    expect(pullRequestContributors.pagination).toEqual(pagination);
  });
});
