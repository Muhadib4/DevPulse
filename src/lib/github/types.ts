export interface Developer {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string;
  created_at: string;
  followers: number;
  following: number;
  public_repos: number;
}
export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  subscribers_count?: number;
  topics: string[];
  license: { spdx_id: string } | null;
  updated_at: string;
  created_at: string;
  pushed_at: string;
  archived: boolean;
  fork: boolean;
  default_branch: string;
  size: number;
  visibility: string;
  clone_url: string;
}
export interface GitEvent {
  id: string;
  type: string;
  repo: { name: string };
  created_at: string;
  payload: {
    action?: string;
    size?: number;
    commits?: { sha: string; message: string }[];
    ref_type?: string;
  };
}
export interface Rate {
  remaining: number;
  limit: number;
  reset: number;
}
export interface DeveloperData {
  profile: Developer;
  repos: Repository[];
  events: GitEvent[];
  repoTruncated: boolean;
  eventTruncated: boolean;
  warnings: string[];
}
export interface SearchData {
  items: Repository[];
  total_count: number;
  incomplete_results: boolean;
}
export interface RepoData {
  repo: Repository;
  languages: Record<string, number>;
  readme: string | null;
  warnings: string[];
}
export interface ContributionData {
  available: boolean;
  reason?: string;
  totalContributions?: number;
  weeks?: {
    contributionDays: {
      date: string;
      contributionCount: number;
      contributionLevel: string;
    }[];
  }[];
}
