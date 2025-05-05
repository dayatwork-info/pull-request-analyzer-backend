import { RepositoryContributorsDto } from './repo-contributors.dto';
import { ContributorDto, PaginationMetaDto } from './contributor.dto';

describe('RepositoryContributorsDto', () => {
  it('should create a valid repository contributors dto', () => {
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

    const repoContributors = new RepositoryContributorsDto();
    repoContributors.repository = 'owner/repo';
    repoContributors.contributors = [contributor1, contributor2];
    repoContributors.pagination = pagination;

    expect(repoContributors).toBeDefined();
    expect(repoContributors.repository).toBe('owner/repo');
    expect(repoContributors.contributors).toHaveLength(2);
    expect(repoContributors.contributors[0]).toEqual(contributor1);
    expect(repoContributors.contributors[1]).toEqual(contributor2);
    expect(repoContributors.pagination).toEqual(pagination);
  });

  it('should allow serialization to JSON', () => {
    const contributor = new ContributorDto();
    contributor.id = 12345;
    contributor.login = 'octocat';
    contributor.avatar_url = 'https://github.com/images/avatar.png';
    contributor.html_url = 'https://github.com/octocat';
    contributor.contributions = 42;

    const pagination = new PaginationMetaDto();
    pagination.current_page = 1;
    pagination.per_page = 30;
    pagination.total_contributors = 1;

    const repoContributors = new RepositoryContributorsDto();
    repoContributors.repository = 'owner/repo';
    repoContributors.contributors = [contributor];
    repoContributors.pagination = pagination;

    const serialized = JSON.stringify(repoContributors);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual({
      repository: 'owner/repo',
      contributors: [
        {
          id: 12345,
          login: 'octocat',
          avatar_url: 'https://github.com/images/avatar.png',
          html_url: 'https://github.com/octocat',
          contributions: 42,
        },
      ],
      pagination: {
        current_page: 1,
        per_page: 30,
        total_contributors: 1,
      },
    });
  });
});
