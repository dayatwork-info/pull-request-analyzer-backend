import {
  GitHubPullRequestDto,
  GitHubPullRequestFileDto,
  GitHubPullRequestDetailDto,
} from './github-pull-request.dto';

describe('GitHub DTOs', () => {
  describe('GitHubPullRequestDto', () => {
    it('should create a valid pull request dto', () => {
      const pullRequest: GitHubPullRequestDto = {
        url: 'https://api.github.com/repos/octocat/hello-world/pulls/42',
        id: 12345,
        node_id: 'MDExOlB1bGxSZXF1ZXN0MTIzNDU=',
        html_url: 'https://github.com/octocat/hello-world/pull/42',
        diff_url: 'https://github.com/octocat/hello-world/pull/42.diff',
        patch_url: 'https://github.com/octocat/hello-world/pull/42.patch',
        issue_url: 'https://api.github.com/repos/octocat/hello-world/issues/42',
        number: 42,
        state: 'open',
        locked: false,
        title: 'Update README.md',
        user: {
          login: 'octocat',
          id: 583231,
          node_id: 'MDQ6VXNlcjU4MzIzMQ==',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          html_url: 'https://github.com/octocat',
          type: 'User',
          site_admin: false,
        },
        body: 'This is a pull request to update the README',
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-02T11:00:00Z',
        closed_at: null,
        merged_at: null,
        merge_commit_sha: null,
        assignee: null,
        assignees: [],
        requested_reviewers: [],
        requested_teams: [],
        labels: [],
        milestone: null,
        draft: false,
        commits_url:
          'https://api.github.com/repos/octocat/hello-world/pulls/42/commits',
        review_comments_url:
          'https://api.github.com/repos/octocat/hello-world/pulls/42/comments',
        review_comment_url:
          'https://api.github.com/repos/octocat/hello-world/pulls/comments{/number}',
        comments_url:
          'https://api.github.com/repos/octocat/hello-world/issues/42/comments',
        statuses_url:
          'https://api.github.com/repos/octocat/hello-world/statuses/abc123',
        head: {
          label: 'octocat:feature-branch',
          ref: 'feature-branch',
          sha: 'abc123',
          user: {
            login: 'octocat',
            id: 583231,
            node_id: 'MDQ6VXNlcjU4MzIzMQ==',
            avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
            html_url: 'https://github.com/octocat',
            type: 'User',
            site_admin: false,
          },
          repo: {
            id: 12345,
            node_id: 'MDEwOlJlcG9zaXRvcnkxMjM0NQ==',
            name: 'hello-world',
            full_name: 'octocat/hello-world',
            private: false,
            owner: {
              login: 'octocat',
              id: 583231,
              node_id: 'MDQ6VXNlcjU4MzIzMQ==',
              avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
              html_url: 'https://github.com/octocat',
              type: 'User',
              site_admin: false,
            },
            html_url: 'https://github.com/octocat/hello-world',
            description: 'A simple hello world project',
            fork: false,
            url: 'https://api.github.com/repos/octocat/hello-world',
            created_at: '2023-01-01T09:00:00Z',
            updated_at: '2023-01-01T09:30:00Z',
            pushed_at: '2023-01-01T10:00:00Z',
            git_url: 'git://github.com/octocat/hello-world.git',
            ssh_url: 'git@github.com:octocat/hello-world.git',
            clone_url: 'https://github.com/octocat/hello-world.git',
            size: 100,
            stargazers_count: 5,
            watchers_count: 5,
            language: 'JavaScript',
            has_issues: true,
            has_projects: true,
            has_downloads: true,
            has_wiki: true,
            has_pages: false,
            has_discussions: false,
            forks_count: 2,
            archived: false,
            disabled: false,
            open_issues_count: 1,
            license: null,
            allow_forking: true,
            is_template: false,
            web_commit_signoff_required: false,
            topics: ['hello-world', 'example'],
            visibility: 'public',
            default_branch: 'main',
          },
        },
        base: {
          label: 'octocat:main',
          ref: 'main',
          sha: 'def456',
          user: {
            login: 'octocat',
            id: 583231,
            node_id: 'MDQ6VXNlcjU4MzIzMQ==',
            avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
            html_url: 'https://github.com/octocat',
            type: 'User',
            site_admin: false,
          },
          repo: {
            id: 12345,
            node_id: 'MDEwOlJlcG9zaXRvcnkxMjM0NQ==',
            name: 'hello-world',
            full_name: 'octocat/hello-world',
            private: false,
            owner: {
              login: 'octocat',
              id: 583231,
              node_id: 'MDQ6VXNlcjU4MzIzMQ==',
              avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
              html_url: 'https://github.com/octocat',
              type: 'User',
              site_admin: false,
            },
            html_url: 'https://github.com/octocat/hello-world',
            description: 'A simple hello world project',
            fork: false,
            url: 'https://api.github.com/repos/octocat/hello-world',
            created_at: '2023-01-01T09:00:00Z',
            updated_at: '2023-01-01T09:30:00Z',
            pushed_at: '2023-01-01T10:00:00Z',
            git_url: 'git://github.com/octocat/hello-world.git',
            ssh_url: 'git@github.com:octocat/hello-world.git',
            clone_url: 'https://github.com/octocat/hello-world.git',
            size: 100,
            stargazers_count: 5,
            watchers_count: 5,
            language: 'JavaScript',
            has_issues: true,
            has_projects: true,
            has_downloads: true,
            has_wiki: true,
            has_pages: false,
            has_discussions: false,
            forks_count: 2,
            archived: false,
            disabled: false,
            open_issues_count: 1,
            license: null,
            allow_forking: true,
            is_template: false,
            web_commit_signoff_required: false,
            topics: ['hello-world', 'example'],
            visibility: 'public',
            default_branch: 'main',
          },
        },
        author_association: 'OWNER',
        auto_merge: null,
        active_lock_reason: null,
        merged: false,
        mergeable: true,
        rebaseable: true,
        mergeable_state: 'clean',
        merged_by: null,
        comments: 0,
        review_comments: 0,
        maintainer_can_modify: false,
        commits: 1,
        additions: 10,
        deletions: 2,
        changed_files: 1,
      };

      expect(pullRequest).toBeDefined();
      expect(pullRequest.id).toBe(12345);
      expect(pullRequest.number).toBe(42);
      expect(pullRequest.state).toBe('open');
      expect(pullRequest.title).toBe('Update README.md');
    });
  });

  describe('GitHubPullRequestFileDto', () => {
    it('should create a valid pull request file dto', () => {
      const file: GitHubPullRequestFileDto = {
        sha: 'abc123',
        filename: 'README.md',
        status: 'modified',
        additions: 10,
        deletions: 2,
        changes: 12,
        blob_url:
          'https://github.com/octocat/hello-world/blob/abc123/README.md',
        raw_url: 'https://github.com/octocat/hello-world/raw/abc123/README.md',
        contents_url:
          'https://api.github.com/repos/octocat/hello-world/contents/README.md?ref=abc123',
        patch:
          '@@ -1,3 +1,11 @@\n # Hello World\n \n-This is a simple project.\n+This is a simple hello world project.\n+\n+## Features\n+\n+- Feature 1\n+- Feature 2\n+- Feature 3\n+\n+## License\n+\n+MIT',
      };

      expect(file).toBeDefined();
      expect(file.sha).toBe('abc123');
      expect(file.filename).toBe('README.md');
      expect(file.status).toBe('modified');
      expect(file.additions).toBe(10);
      expect(file.deletions).toBe(2);
      expect(file.changes).toBe(12);
    });

    it('should support renamed files', () => {
      const file: GitHubPullRequestFileDto = {
        sha: 'abc123',
        filename: 'new-name.md',
        status: 'renamed',
        additions: 0,
        deletions: 0,
        changes: 0,
        blob_url:
          'https://github.com/octocat/hello-world/blob/abc123/new-name.md',
        raw_url:
          'https://github.com/octocat/hello-world/raw/abc123/new-name.md',
        contents_url:
          'https://api.github.com/repos/octocat/hello-world/contents/new-name.md?ref=abc123',
        previous_filename: 'old-name.md',
      };

      expect(file).toBeDefined();
      expect(file.status).toBe('renamed');
      expect(file.previous_filename).toBe('old-name.md');
    });
  });

  describe('GitHubPullRequestDetailDto', () => {
    it('should create a valid pull request detail dto', () => {
      const file: GitHubPullRequestFileDto = {
        sha: 'abc123',
        filename: 'README.md',
        status: 'modified',
        additions: 10,
        deletions: 2,
        changes: 12,
        blob_url:
          'https://github.com/octocat/hello-world/blob/abc123/README.md',
        raw_url: 'https://github.com/octocat/hello-world/raw/abc123/README.md',
        contents_url:
          'https://api.github.com/repos/octocat/hello-world/contents/README.md?ref=abc123',
        patch:
          '@@ -1,3 +1,11 @@\n # Hello World\n \n-This is a simple project.\n+This is a simple hello world project.',
      };

      const prDetail: GitHubPullRequestDetailDto = {
        // Include all required GitHubPullRequestDto fields
        url: 'https://api.github.com/repos/octocat/hello-world/pulls/42',
        id: 12345,
        node_id: 'MDExOlB1bGxSZXF1ZXN0MTIzNDU=',
        html_url: 'https://github.com/octocat/hello-world/pull/42',
        diff_url: 'https://github.com/octocat/hello-world/pull/42.diff',
        patch_url: 'https://github.com/octocat/hello-world/pull/42.patch',
        issue_url: 'https://api.github.com/repos/octocat/hello-world/issues/42',
        number: 42,
        state: 'open',
        locked: false,
        title: 'Update README.md',
        user: {
          login: 'octocat',
          id: 583231,
          node_id: 'MDQ6VXNlcjU4MzIzMQ==',
          avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
          html_url: 'https://github.com/octocat',
          type: 'User',
          site_admin: false,
        },
        body: 'This is a pull request to update the README',
        created_at: '2023-01-01T10:00:00Z',
        updated_at: '2023-01-02T11:00:00Z',
        closed_at: null,
        merged_at: null,
        merge_commit_sha: null,
        assignee: null,
        assignees: [],
        requested_reviewers: [],
        requested_teams: [],
        labels: [],
        milestone: null,
        draft: false,
        commits_url:
          'https://api.github.com/repos/octocat/hello-world/pulls/42/commits',
        review_comments_url:
          'https://api.github.com/repos/octocat/hello-world/pulls/42/comments',
        review_comment_url:
          'https://api.github.com/repos/octocat/hello-world/pulls/comments{/number}',
        comments_url:
          'https://api.github.com/repos/octocat/hello-world/issues/42/comments',
        statuses_url:
          'https://api.github.com/repos/octocat/hello-world/statuses/abc123',
        head: {
          label: 'octocat:feature-branch',
          ref: 'feature-branch',
          sha: 'abc123',
          user: {
            login: 'octocat',
            id: 583231,
            node_id: 'MDQ6VXNlcjU4MzIzMQ==',
            avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
            html_url: 'https://github.com/octocat',
            type: 'User',
            site_admin: false,
          },
          repo: null,
        },
        base: {
          label: 'octocat:main',
          ref: 'main',
          sha: 'def456',
          user: {
            login: 'octocat',
            id: 583231,
            node_id: 'MDQ6VXNlcjU4MzIzMQ==',
            avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
            html_url: 'https://github.com/octocat',
            type: 'User',
            site_admin: false,
          },
          repo: {
            id: 12345,
            node_id: 'MDEwOlJlcG9zaXRvcnkxMjM0NQ==',
            name: 'hello-world',
            full_name: 'octocat/hello-world',
            private: false,
            owner: {
              login: 'octocat',
              id: 583231,
              node_id: 'MDQ6VXNlcjU4MzIzMQ==',
              avatar_url: 'https://avatars.githubusercontent.com/u/583231?v=4',
              html_url: 'https://github.com/octocat',
              type: 'User',
              site_admin: false,
            },
            html_url: 'https://github.com/octocat/hello-world',
            description: 'A simple hello world project',
            fork: false,
            url: 'https://api.github.com/repos/octocat/hello-world',
            created_at: '2023-01-01T09:00:00Z',
            updated_at: '2023-01-01T09:30:00Z',
            pushed_at: '2023-01-01T10:00:00Z',
            git_url: 'git://github.com/octocat/hello-world.git',
            ssh_url: 'git@github.com:octocat/hello-world.git',
            clone_url: 'https://github.com/octocat/hello-world.git',
            size: 100,
            stargazers_count: 5,
            watchers_count: 5,
            language: 'JavaScript',
            has_issues: true,
            has_projects: true,
            has_downloads: true,
            has_wiki: true,
            has_pages: false,
            has_discussions: false,
            forks_count: 2,
            archived: false,
            disabled: false,
            open_issues_count: 1,
            license: null,
            allow_forking: true,
            is_template: false,
            web_commit_signoff_required: false,
            topics: ['hello-world', 'example'],
            visibility: 'public',
            default_branch: 'main',
          },
        },
        author_association: 'OWNER',
        auto_merge: null,
        active_lock_reason: null,
        merged: false,
        mergeable: true,
        rebaseable: true,
        mergeable_state: 'clean',
        merged_by: null,
        comments: 0,
        review_comments: 0,
        maintainer_can_modify: false,
        commits: 1,
        additions: 10,
        deletions: 2,
        changed_files: 1,
        // Add GitHubPullRequestDetailDto specific fields
        files: [file],
        prSummary: 'Update README with detailed project information',
      };

      expect(prDetail).toBeDefined();
      expect(prDetail.id).toBe(12345);
      expect(prDetail.number).toBe(42);
      expect(prDetail.files).toHaveLength(1);
      expect(prDetail.files[0]).toEqual(file);
      expect(prDetail.prSummary).toBe(
        'Update README with detailed project information',
      );
    });
  });
});
