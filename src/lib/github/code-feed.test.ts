import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import {
  applyOverride,
  buildEntriesFromRepos,
  buildCodeEntries,
  mergeAndBuildEntries,
  mergeRepoRefs,
  sortAndLimitRepos,
  type CodeOverrides,
  type RepoDetails,
  type RepoRef,
} from "./code-feed.ts";

const username = "jgabor";

function pushedDaysAgo(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

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
    const recent = [repoRef("spela", pushedDaysAgo(1))];

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
      repoRef("fresh-1", pushedDaysAgo(1)),
      repoRef("fresh-2", pushedDaysAgo(2)),
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
      repoRef("fresh", pushedDaysAgo(1)),
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
    const pinnedAt = pushedDaysAgo(3);
    const recentAt = pushedDaysAgo(1);
    const pinned = [repoRef("agentera", pinnedAt, true)];
    const recent = [repoRef("spela", recentAt)];
    const details = [repoDetails("agentera", pinnedAt, true), repoDetails("spela", recentAt)];
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

describe("buildCodeEntries", () => {
  it("trims whitespace from token before using it in fetch headers", async () => {
    const calls: { authHeader: string | null }[] = [];
    const mockFetch = async (url: string | URL, init?: RequestInit) => {
      const auth =
        init?.headers instanceof Headers
          ? init.headers.get("Authorization")
          : ((init?.headers as Record<string, string>)?.Authorization ?? null);
      calls.push({ authHeader: auth });

      const urlStr = url.toString();
      if (urlStr.includes("/graphql")) {
        return new Response(
          JSON.stringify({
            data: {
              user: {
                pinnedItems: { nodes: [] },
              },
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (urlStr.includes("/users/")) {
        return new Response(JSON.stringify([]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("{}", { status: 200 });
    };

    await buildCodeEntries({
      username,
      overrides: {},
      token: "  ghp_test_token_123  \n",
      fetchImpl: mockFetch as typeof fetch,
    });

    assert.ok(calls.length > 0, "should have made at least one fetch call");
    for (const call of calls) {
      assert.equal(
        call.authHeader,
        "Bearer ghp_test_token_123",
        `token should be trimmed, got: ${call.authHeader}`,
      );
    }
  });

  it("reports snapshot fallback without fetching when token is missing", async (t: TestContext) => {
    const warnings = t.mock.method(console, "warn", () => {});
    let fetched = false;
    const mockFetch = async () => {
      fetched = true;
      return new Response("{}", { status: 200 });
    };

    const entries = await buildCodeEntries({
      username,
      overrides: {},
      token: "",
      fetchImpl: mockFetch as typeof fetch,
    });

    assert.equal(fetched, false, "should not have called fetch without a token");
    assert.ok(entries.length > 0, "should return snapshot entries");
    assert.equal(warnings.mock.calls[0].arguments[0], "[code-feed] status=snapshot");
  });

  it("rejects a missing token when a live feed is required", async (t: TestContext) => {
    const warnings = t.mock.method(console, "warn", () => {});
    let fetched = false;
    await assert.rejects(
      buildCodeEntries({
        username,
        overrides: {},
        token: "",
        requireLive: true,
        fetchImpl: async () => {
          fetched = true;
          throw new Error("Fetch must not run");
        },
      }),
      /Live GitHub code feed required: GH_PROFILE_TOKEN is missing/,
    );
    assert.equal(fetched, false);
    assert.equal(warnings.mock.calls[0].arguments[0], "[code-feed] status=failed");
  });

  for (const status of [401, 503]) {
    for (const requireLive of [false, true]) {
      it(`${requireLive ? "rejects" : "falls back on"} GitHub HTTP ${status}`, async (t: TestContext) => {
        const warnings = t.mock.method(console, "warn", () => {});
        const result = buildCodeEntries({
          username,
          overrides: {},
          token: "test-token",
          requireLive,
          fetchImpl: async () => new Response("", { status }),
        });
        if (requireLive) {
          await assert.rejects(result, new RegExp(`Live GitHub code feed required: .* ${status}`));
        } else {
          assert.ok((await result).length > 0);
        }
        assert.equal(
          warnings.mock.calls[0].arguments[0],
          `[code-feed] status=${requireLive ? "failed" : "snapshot"}`,
        );
      });
    }
  }

  for (const requireLive of [false, true]) {
    it(`${requireLive ? "rejects" : "falls back on"} a network failure`, async (t: TestContext) => {
      t.mock.method(console, "warn", () => {});
      const result = buildCodeEntries({
        username,
        overrides: {},
        token: "test-token",
        requireLive,
        fetchImpl: async () => {
          throw new Error("Network unavailable");
        },
      });
      if (requireLive) {
        await assert.rejects(result, /Live GitHub code feed required: Network unavailable/);
      } else {
        assert.ok((await result).length > 0);
      }
    });
  }

  it("returns and reports live data in strict mode", async (t: TestContext) => {
    const messages = t.mock.method(console, "info", () => {});
    const warnings = t.mock.method(console, "warn", () => {});
    const pushedAt = pushedDaysAgo(1);
    const entries = await buildCodeEntries({
      username,
      overrides: {},
      token: "test-token",
      requireLive: true,
      fetchImpl: async (url) => {
        if (String(url).includes("/graphql")) {
          return Response.json({ data: { user: { pinnedItems: { nodes: [] } } } });
        }
        if (String(url).includes("/users/")) {
          return Response.json([
            { name: "new-project", full_name: "jgabor/new-project", pushed_at: pushedAt },
          ]);
        }
        return Response.json({
          html_url: "https://github.com/jgabor/new-project",
          description: "Live project",
          pushed_at: pushedAt,
          language: "Go",
        });
      },
    });
    assert.deepEqual(
      entries.map((entry) => entry.id),
      ["new-project"],
    );
    assert.equal(entries[0].description, "Live project");
    assert.equal(messages.mock.calls[0].arguments[0], "[code-feed] status=live");
    assert.equal(warnings.mock.callCount(), 0);
  });
});
