import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyOverride,
  buildEntriesFromRepos,
  mergeAndBuildEntries,
  mergeRepoRefs,
  sortAndLimitRepos,
  type CodeOverrides,
  type RepoDetails,
  type RepoRef,
} from "./code-feed.ts";

const username = "jgabor";

function repoRef(name: string, pushedAt: string, isPinned = false): RepoRef {
  return {
    owner: username,
    name,
    fullName: `${username}/${name}`,
    isPinned,
    pushedAt,
  };
}

function repoDetails(name: string, pushedAt: string, isPinned = false): RepoDetails {
  return {
    owner: username,
    name,
    fullName: `${username}/${name}`,
    url: `https://github.com/${username}/${name}`,
    description: `${name} description`,
    pushedAt,
    topics: ["tooling"],
    primaryLanguage: "TypeScript",
    isPinned,
  };
}

describe("mergeRepoRefs", () => {
  it("always includes pinned repos even when stale", () => {
    const pinned = [repoRef("agentera", "2020-01-01T00:00:00Z", true)];
    const recent: RepoRef[] = [];

    const merged = mergeRepoRefs(pinned, recent, {}, username, 90);
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.name, "agentera");
  });

  it("includes recent non-pinned repos within the activity window", () => {
    const pinned: RepoRef[] = [];
    const recent = [repoRef("spela", "2026-06-01T00:00:00Z")];

    const merged = mergeRepoRefs(pinned, recent, {}, username, 90);
    assert.equal(merged.length, 1);
    assert.equal(merged[0]?.name, "spela");
  });

  it("drops stale non-pinned repos outside the activity window", () => {
    const pinned: RepoRef[] = [];
    const recent = [repoRef("old-repo", "2020-01-01T00:00:00Z")];

    const merged = mergeRepoRefs(pinned, recent, {}, username, 90);
    assert.equal(merged.length, 0);
  });

  it("honors forceInclude and exclude overrides", () => {
    const overrides: CodeOverrides = {
      tuta: { forceInclude: true },
      noisy: { exclude: true },
    };
    const pinned = [repoRef("noisy", "2026-06-01T00:00:00Z", true)];

    const merged = mergeRepoRefs(pinned, [], overrides, username, 90);
    assert.deepEqual(merged.map((repo) => repo.name).sort(), ["tuta"]);
  });

  it("backfills stale repos to meet minEntries", () => {
    const pinned: RepoRef[] = [];
    const recent = [
      repoRef("fresh-1", "2026-06-10T00:00:00Z"),
      repoRef("fresh-2", "2026-06-09T00:00:00Z"),
      repoRef("stale-1", "2024-01-01T00:00:00Z"),
      repoRef("stale-2", "2023-01-01T00:00:00Z"),
    ];

    const merged = mergeRepoRefs(pinned, recent, {}, username, 90, 3);
    assert.equal(merged.length, 3);
    assert.deepEqual(
      merged.map((r) => r.name),
      ["fresh-1", "fresh-2", "stale-1"],
    );
  });

  it("skips excluded repos during backfill", () => {
    const overrides: CodeOverrides = {
      "stale-bad": { exclude: true },
    };
    const pinned: RepoRef[] = [];
    const recent = [
      repoRef("fresh", "2026-06-10T00:00:00Z"),
      repoRef("stale-good", "2024-01-01T00:00:00Z"),
      repoRef("stale-bad", "2023-01-01T00:00:00Z"),
    ];

    const merged = mergeRepoRefs(pinned, recent, overrides, username, 90, 2);
    assert.equal(merged.length, 2);
    assert.deepEqual(
      merged.map((r) => r.name),
      ["fresh", "stale-good"],
    );
  });
});

describe("sortAndLimitRepos", () => {
  it("sorts by pushedAt descending and caps entries", () => {
    const repos = [
      repoRef("a", "2026-06-01T00:00:00Z"),
      repoRef("b", "2026-06-10T00:00:00Z"),
      repoRef("c", "2026-05-01T00:00:00Z"),
    ];

    const sorted = sortAndLimitRepos(repos, 2);
    assert.deepEqual(
      sorted.map((repo) => repo.name),
      ["b", "a"],
    );
  });
});

describe("applyOverride", () => {
  it("prefers override copy over GitHub defaults", () => {
    const entry = applyOverride(repoDetails("agentera", "2026-06-01T00:00:00Z", true), {
      title: "Agentera",
      type: "Skill Ecosystem",
      description: "Custom copy",
      tags: ["Python"],
    });

    assert.deepEqual(entry, {
      id: "agentera",
      title: "Agentera",
      type: "Skill Ecosystem",
      description: "Custom copy",
      tags: ["Python"],
      url: "https://github.com/jgabor/agentera",
    });
  });
});

describe("mergeAndBuildEntries", () => {
  it("builds display entries from merged repo activity", () => {
    const pinned = [repoRef("agentera", "2026-06-08T00:00:00Z", true)];
    const recent = [repoRef("spela", "2026-06-10T00:00:00Z")];
    const details = [
      repoDetails("agentera", "2026-06-08T00:00:00Z", true),
      repoDetails("spela", "2026-06-10T00:00:00Z"),
    ];
    const overrides: CodeOverrides = {
      agentera: { title: "Agentera", type: "Skill Ecosystem", tags: ["Python"] },
    };

    const entries = mergeAndBuildEntries(pinned, recent, details, {
      username,
      overrides,
      maxEntries: 10,
      sinceDays: 90,
    });

    assert.equal(entries.length, 2);
    assert.equal(entries[0]?.id, "spela");
    assert.equal(entries[1]?.title, "Agentera");
    assert.equal(entries[1]?.type, "Skill Ecosystem");
  });
});

describe("buildEntriesFromRepos", () => {
  it("falls back to GitHub metadata when overrides are missing", () => {
    const entries = buildEntriesFromRepos([repoDetails("new-repo", "2026-06-01T00:00:00Z")], {});

    assert.equal(entries[0]?.title, "New Repo");
    assert.equal(entries[0]?.type, "tooling");
    assert.equal(entries[0]?.description, "new-repo description");
    assert.deepEqual(entries[0]?.tags, ["TypeScript", "tooling"]);
  });
});
