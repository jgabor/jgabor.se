import snapshot from "../../data/code.snapshot.json" with { type: "json" };

export interface CodeEntry {
  id: string;
  title: string;
  type: string;
  description: string;
  tags: string[];
  url?: string;
}

export interface CodeOverride {
  title?: string;
  type?: string;
  description?: string;
  tags?: string[];
  forceInclude?: boolean;
  exclude?: boolean;
}

export type CodeOverrides = Record<string, CodeOverride>;

export interface RepoRef {
  owner: string;
  name: string;
  fullName: string;
  isPinned: boolean;
  pushedAt: string;
}

interface RepoDetails {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  pushedAt: string;
  topics: string[];
  primaryLanguage: string | null;
  isPinned: boolean;
}

interface BuildCodeEntriesOptions {
  username: string;
  overrides: CodeOverrides;
  maxEntries?: number;
  sinceDays?: number;
  minEntries?: number;
  token?: string;
  fetchImpl?: typeof fetch;
}

interface MergeOptions {
  username: string;
  overrides: CodeOverrides;
  maxEntries: number;
  sinceDays: number;
  minEntries?: number;
}

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const DEFAULT_MAX_ENTRIES = 10;
const DEFAULT_SINCE_DAYS = 90;
const MAX_REPO_PAGES = 10;
const REPOS_PER_PAGE = 100;

function githubHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "jgabor.se-code-feed",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function parseRepoFullName(fullName: string): { owner: string; name: string } | null {
  const [owner, name] = fullName.split("/");
  if (!owner || !name) return null;
  return { owner, name };
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function titleFromRepoName(name: string): string {
  return name
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function defaultTags(language: string | null, topics: string[]): string[] {
  const tags = new Set<string>();
  if (language) tags.add(language);
  for (const topic of topics) {
    tags.add(topic);
  }
  return [...tags];
}

export function applyOverride(repo: RepoDetails, override?: CodeOverride): CodeEntry {
  const description = override?.description ?? repo.description ?? "";
  const tags = override?.tags ?? defaultTags(repo.primaryLanguage, repo.topics);
  const type = override?.type ?? repo.topics[0] ?? "Open Source";

  return {
    id: repo.name,
    title: override?.title ?? titleFromRepoName(repo.name),
    type,
    description,
    tags,
    url: repo.url,
  };
}

export function mergeRepoRefs(
  pinned: RepoRef[],
  recent: RepoRef[],
  overrides: CodeOverrides,
  username: string,
  sinceDays: number,
  minEntries = 0,
): RepoRef[] {
  const cutoff = daysAgo(sinceDays);
  const byFullName = new Map<string, RepoRef>();

  for (const repo of pinned) {
    byFullName.set(repo.fullName, { ...repo, isPinned: true });
  }

  for (const repo of recent) {
    const existing = byFullName.get(repo.fullName);
    const pushedAt = new Date(repo.pushedAt);

    if (existing) {
      if (pushedAt > new Date(existing.pushedAt)) {
        existing.pushedAt = repo.pushedAt;
      }
      continue;
    }

    byFullName.set(repo.fullName, { ...repo, isPinned: false });
  }

  for (const [name, override] of Object.entries(overrides)) {
    if (!override.forceInclude || override.exclude) continue;
    const fullName = `${username}/${name}`;
    if (byFullName.has(fullName)) continue;
    byFullName.set(fullName, {
      owner: username,
      name,
      fullName,
      isPinned: false,
      pushedAt: new Date(0).toISOString(),
    });
  }

  const all = [...byFullName.values()];
  const strict = all.filter((repo) => {
    const override = overrides[repo.name];
    if (override?.exclude) return false;
    if (repo.isPinned) return true;
    if (override?.forceInclude) return true;
    return new Date(repo.pushedAt) >= cutoff;
  });

  if (strict.length >= minEntries) return strict;

  const strictKeys = new Set(strict.map((r) => r.fullName));
  const backfill = all
    .filter((repo) => !strictKeys.has(repo.fullName) && !overrides[repo.name]?.exclude)
    .sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime())
    .slice(0, minEntries - strict.length);

  return [...strict, ...backfill];
}

export function sortAndLimitRepos(repos: RepoRef[], maxEntries: number): RepoRef[] {
  return [...repos]
    .sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime())
    .slice(0, maxEntries);
}

export function buildEntriesFromRepos(repos: RepoDetails[], overrides: CodeOverrides): CodeEntry[] {
  return repos.map((repo) => applyOverride(repo, overrides[repo.name]));
}

export function mergeAndBuildEntries(
  pinned: RepoRef[],
  recent: RepoRef[],
  details: RepoDetails[],
  options: MergeOptions,
): CodeEntry[] {
  const merged = mergeRepoRefs(
    pinned,
    recent,
    options.overrides,
    options.username,
    options.sinceDays,
    options.minEntries,
  );
  const limited = sortAndLimitRepos(merged, options.maxEntries);
  const detailsByName = new Map(details.map((repo) => [repo.fullName, repo]));

  const resolved = limited.map((repo) => {
    const detail = detailsByName.get(repo.fullName);
    if (detail) return detail;
    return {
      owner: repo.owner,
      name: repo.name,
      fullName: repo.fullName,
      url: `https://github.com/${repo.fullName}`,
      description: null,
      pushedAt: repo.pushedAt,
      topics: [],
      primaryLanguage: null,
      isPinned: repo.isPinned,
    } satisfies RepoDetails;
  });

  return buildEntriesFromRepos(resolved, options.overrides);
}

async function githubGraphql<T>(
  query: string,
  variables: Record<string, unknown>,
  token: string | undefined,
  fetchImpl: typeof fetch,
): Promise<T> {
  const response = await fetchImpl(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      ...githubHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  if (!payload.data) {
    throw new Error("GitHub GraphQL returned no data");
  }

  return payload.data;
}

export async function fetchPinnedRepos(
  username: string,
  token: string | undefined,
  fetchImpl: typeof fetch,
): Promise<RepoRef[]> {
  const query = `
    query($login: String!) {
      user(login: $login) {
        pinnedItems(first: 6, types: REPOSITORY) {
          nodes {
            ... on Repository {
              name
              nameWithOwner
              pushedAt
            }
          }
        }
      }
    }
  `;

  const data = await githubGraphql<{
    user: {
      pinnedItems: {
        nodes: Array<{
          name: string;
          nameWithOwner: string;
          pushedAt: string;
        }>;
      };
    } | null;
  }>(query, { login: username }, token, fetchImpl);

  if (!data.user) return [];

  return data.user.pinnedItems.nodes.map((repo) => ({
    owner: username,
    name: repo.name,
    fullName: repo.nameWithOwner,
    isPinned: true,
    pushedAt: repo.pushedAt,
  }));
}

export async function fetchRecentPushRepos(
  username: string,
  token: string | undefined,
  fetchImpl: typeof fetch,
): Promise<RepoRef[]> {
  const repos: RepoRef[] = [];

  for (let page = 1; page <= MAX_REPO_PAGES; page += 1) {
    const response = await fetchImpl(
      `https://api.github.com/users/${username}/repos?sort=pushed&direction=desc&per_page=${REPOS_PER_PAGE}&page=${page}&type=owner`,
      { headers: githubHeaders(token) },
    );

    if (!response.ok) {
      throw new Error(`GitHub Repos API failed: ${response.status} ${response.statusText}`);
    }

    const pageRepos = (await response.json()) as Array<{
      name: string;
      full_name: string;
      pushed_at: string | null;
    }>;

    if (pageRepos.length === 0) break;

    for (const repo of pageRepos) {
      if (!repo.pushed_at) continue;
      const parsed = parseRepoFullName(repo.full_name);
      if (!parsed || parsed.owner !== username) continue;
      repos.push({
        owner: username,
        name: parsed.name,
        fullName: repo.full_name,
        isPinned: false,
        pushedAt: repo.pushed_at,
      });
    }

    if (pageRepos.length < REPOS_PER_PAGE) break;
  }

  return repos;
}

export async function enrichRepos(
  repos: RepoRef[],
  token: string | undefined,
  fetchImpl: typeof fetch,
): Promise<RepoDetails[]> {
  if (repos.length === 0) return [];

  const details = await Promise.all(
    repos.map(async (repo) => {
      const response = await fetchImpl(`https://api.github.com/repos/${repo.fullName}`, {
        headers: githubHeaders(token),
      });

      if (!response.ok) {
        return {
          owner: repo.owner,
          name: repo.name,
          fullName: repo.fullName,
          url: `https://github.com/${repo.fullName}`,
          description: null,
          pushedAt: repo.pushedAt,
          topics: [],
          primaryLanguage: null,
          isPinned: repo.isPinned,
        } satisfies RepoDetails;
      }

      const payload = (await response.json()) as {
        html_url: string;
        description: string | null;
        pushed_at: string;
        topics?: string[];
        language: string | null;
      };

      return {
        owner: repo.owner,
        name: repo.name,
        fullName: repo.fullName,
        url: payload.html_url,
        description: payload.description,
        pushedAt: payload.pushed_at || repo.pushedAt,
        topics: payload.topics ?? [],
        primaryLanguage: payload.language,
        isPinned: repo.isPinned,
      } satisfies RepoDetails;
    }),
  );

  return details;
}

function resolveToken(explicit?: string): string | undefined {
  const token = explicit ?? process.env.GH_PROFILE_TOKEN ?? import.meta.env?.GH_PROFILE_TOKEN;
  return token?.trim();
}

function loadSnapshotFallback(): CodeEntry[] {
  return snapshot as CodeEntry[];
}

export async function buildCodeEntries(options: BuildCodeEntriesOptions): Promise<CodeEntry[]> {
  const {
    username,
    overrides,
    maxEntries = DEFAULT_MAX_ENTRIES,
    sinceDays = DEFAULT_SINCE_DAYS,
    minEntries = 0,
    fetchImpl = fetch,
  } = options;
  const token = resolveToken(options.token);

  if (!token) {
    return loadSnapshotFallback();
  }

  try {
    const [pinned, recent] = await Promise.all([
      fetchPinnedRepos(username, token, fetchImpl),
      fetchRecentPushRepos(username, token, fetchImpl),
    ]);

    const merged = mergeRepoRefs(pinned, recent, overrides, username, sinceDays, minEntries);
    const limited = sortAndLimitRepos(merged, maxEntries);
    const details = await enrichRepos(limited, token, fetchImpl);

    return buildEntriesFromRepos(details, overrides);
  } catch (error) {
    console.warn("[code-feed] GitHub fetch failed, using snapshot fallback:", error);
    return loadSnapshotFallback();
  }
}
