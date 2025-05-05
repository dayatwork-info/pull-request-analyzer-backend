/**
 * GitHub Pull Request DTO based on the GitHub REST API
 * Reference: https://docs.github.com/en/rest/pulls/pulls#get-a-pull-request
 */
export interface GitHubPullRequestDto {
  url: string;
  id: number;
  node_id: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
  issue_url: string;
  number: number;
  state: string;
  locked: boolean;
  title: string;
  user: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    html_url: string;
    type: string;
    site_admin: boolean;
  };
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  merge_commit_sha: string | null;
  assignee: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    html_url: string;
    type: string;
    site_admin: boolean;
  } | null;
  assignees: Array<{
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    html_url: string;
    type: string;
    site_admin: boolean;
  }> | null;
  requested_reviewers: Array<{
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    html_url: string;
    type: string;
    site_admin: boolean;
  }> | null;
  requested_teams: Array<{
    id: number;
    node_id: string;
    name: string;
    slug: string;
    description: string | null;
    privacy: string;
    html_url: string;
  }> | null;
  labels: Array<{
    id: number;
    node_id: string;
    url: string;
    name: string;
    color: string;
    default: boolean;
    description: string | null;
  }>;
  milestone: {
    url: string;
    html_url: string;
    labels_url: string;
    id: number;
    node_id: string;
    number: number;
    title: string;
    description: string | null;
    creator: {
      login: string;
      id: number;
      node_id: string;
      avatar_url: string;
      html_url: string;
      type: string;
      site_admin: boolean;
    };
    open_issues: number;
    closed_issues: number;
    state: string;
    created_at: string;
    updated_at: string;
    due_on: string | null;
    closed_at: string | null;
  } | null;
  draft: boolean;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  head: {
    label: string;
    ref: string;
    sha: string;
    user: {
      login: string;
      id: number;
      node_id: string;
      avatar_url: string;
      html_url: string;
      type: string;
      site_admin: boolean;
    };
    repo: {
      id: number;
      node_id: string;
      name: string;
      full_name: string;
      private: boolean;
      owner: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        html_url: string;
        type: string;
        site_admin: boolean;
      };
      html_url: string;
      description: string | null;
      fork: boolean;
      url: string;
      created_at: string;
      updated_at: string;
      pushed_at: string;
      git_url: string;
      ssh_url: string;
      clone_url: string;
      size: number;
      stargazers_count: number;
      watchers_count: number;
      language: string | null;
      has_issues: boolean;
      has_projects: boolean;
      has_downloads: boolean;
      has_wiki: boolean;
      has_pages: boolean;
      has_discussions: boolean;
      forks_count: number;
      archived: boolean;
      disabled: boolean;
      open_issues_count: number;
      license: {
        key: string;
        name: string;
        spdx_id: string;
        url: string;
        node_id: string;
      } | null;
      allow_forking: boolean;
      is_template: boolean;
      web_commit_signoff_required: boolean;
      topics: string[];
      visibility: string;
      default_branch: string;
    } | null;
  };
  base: {
    label: string;
    ref: string;
    sha: string;
    user: {
      login: string;
      id: number;
      node_id: string;
      avatar_url: string;
      html_url: string;
      type: string;
      site_admin: boolean;
    };
    repo: {
      id: number;
      node_id: string;
      name: string;
      full_name: string;
      private: boolean;
      owner: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        html_url: string;
        type: string;
        site_admin: boolean;
      };
      html_url: string;
      description: string | null;
      fork: boolean;
      url: string;
      created_at: string;
      updated_at: string;
      pushed_at: string;
      git_url: string;
      ssh_url: string;
      clone_url: string;
      size: number;
      stargazers_count: number;
      watchers_count: number;
      language: string | null;
      has_issues: boolean;
      has_projects: boolean;
      has_downloads: boolean;
      has_wiki: boolean;
      has_pages: boolean;
      has_discussions: boolean;
      forks_count: number;
      archived: boolean;
      disabled: boolean;
      open_issues_count: number;
      license: {
        key: string;
        name: string;
        spdx_id: string;
        url: string;
        node_id: string;
      } | null;
      allow_forking: boolean;
      is_template: boolean;
      web_commit_signoff_required: boolean;
      topics: string[];
      visibility: string;
      default_branch: string;
    };
  };
  author_association: string;
  auto_merge: {
    enabled_by: {
      login: string;
      id: number;
      node_id: string;
      avatar_url: string;
      html_url: string;
      type: string;
      site_admin: boolean;
    };
    merge_method: string;
    commit_title: string;
    commit_message: string;
  } | null;
  active_lock_reason: string | null;
  merged: boolean;
  mergeable: boolean | null;
  rebaseable: boolean | null;
  mergeable_state: string;
  merged_by: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    html_url: string;
    type: string;
    site_admin: boolean;
  } | null;
  comments: number;
  review_comments: number;
  maintainer_can_modify: boolean;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

export interface GitHubPullRequestFileDto {
  sha: string;
  filename: string;
  status:
    | 'added'
    | 'modified'
    | 'removed'
    | 'renamed'
    | 'copied'
    | 'changed'
    | 'unchanged';
  additions: number;
  deletions: number;
  changes: number;
  blob_url: string;
  raw_url: string;
  contents_url: string;
  patch?: string;
  previous_filename?: string;
}

export interface GitHubPullRequestDetailDto extends GitHubPullRequestDto {
  files: GitHubPullRequestFileDto[];
  prSummary?: string;
}

/**
 * GitHub Pull Request Commit DTO based on the GitHub REST API
 * Reference: https://docs.github.com/en/rest/pulls/pulls#list-commits-on-a-pull-request
 */
export interface GitHubContributorDto {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  contributions: number;
}

export interface GitHubCommitDto {
  url: string;
  sha: string;
  node_id: string;
  html_url: string;
  comments_url: string;
  commit: {
    url: string;
    author: {
      name: string;
      email: string;
      date: string;
    };
    committer: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    tree: {
      url: string;
      sha: string;
    };
    comment_count: number;
    verification: {
      verified: boolean;
      reason: string;
      signature: string | null;
      payload: string | null;
    };
  };
  author: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  } | null;
  committer: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  } | null;
  parents: Array<{
    url: string;
    sha: string;
  }>;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: GitHubPullRequestFileDto[];
}
