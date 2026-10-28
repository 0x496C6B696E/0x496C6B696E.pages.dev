/**
 * Typed access to the build-time GitHub snapshot written by scripts/fetch-github.mjs.
 * Nothing here runs in the browser against the API; it is all baked in at build.
 */
import snapshot from "./github.snapshot.json";

export interface GithubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  fork: boolean;
  archived: boolean;
  pushedAt: string;
  createdAt: string;
  htmlUrl: string;
  homepage: string | null;
  topics: string[];
  license: string | null;
}

export interface GithubUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string;
  htmlUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
}

export interface GithubSnapshot {
  fetchedAt: string | null;
  user: GithubUser | null;
  repos: GithubRepo[];
  /** Bytes per language, summed over the developer's own (non-fork) repositories. */
  languages: Record<string, number>;
}

export const github = snapshot as GithubSnapshot;

export const ownRepos: GithubRepo[] = github.repos.filter((r) => !r.fork);

export const totals = {
  repos: ownRepos.length,
  stars: ownRepos.reduce((sum, r) => sum + r.stars, 0),
  forks: ownRepos.reduce((sum, r) => sum + r.forks, 0),
};

export function repoByName(name: string): GithubRepo | undefined {
  return github.repos.find((r) => r.name.toLowerCase() === name.toLowerCase());
}

export interface LanguageShare {
  name: string;
  bytes: number;
  /** 0..100, rounded to one decimal. */
  percent: number;
}

export function languageShares(limit = 8): LanguageShare[] {
  const entries = Object.entries(github.languages);
  const total = entries.reduce((sum, [, bytes]) => sum + bytes, 0);
  if (total === 0) return [];
  return entries
    .map(([name, bytes]) => ({ name, bytes, percent: Math.round((bytes / total) * 1000) / 10 }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, limit);
}

/** Own repositories, most recently pushed first. */
export function recentRepos(limit = 5): GithubRepo[] {
  return [...ownRepos].sort((a, b) => +new Date(b.pushedAt) - +new Date(a.pushedAt)).slice(0, limit);
}
