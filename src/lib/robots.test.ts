import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

interface Group {
  agents: string[];
  rules: Array<[directive: string, value: string]>;
}

const KNOWN_DIRECTIVES = new Set(["user-agent", "allow", "disallow", "content-signal", "sitemap"]);

const REQUIRED_AGENTS = [
  "*",
  // AI search crawlers
  "OAI-SearchBot",
  "Claude-SearchBot",
  "PerplexityBot",
  // Fetchers acting for a user
  "ChatGPT-User",
  "Claude-User",
  "Perplexity-User",
  // AI training crawlers
  "GPTBot",
  "ClaudeBot",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Bytespider",
  "Amazonbot",
  "Meta-ExternalAgent",
];

// Groups follow RFC 9309: consecutive User-agent lines share the rules after them.
function parseRobots(text: string): { groups: Group[]; sitemaps: string[] } {
  const groups: Group[] = [];
  const sitemaps: string[] = [];
  let current: Group | undefined;

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    if (!line) continue;

    const colon = line.indexOf(":");
    assert.ok(colon > 0, `not a directive: ${line}`);
    const directive = line.slice(0, colon).trim().toLowerCase();
    const value = line.slice(colon + 1).trim();
    assert.ok(KNOWN_DIRECTIVES.has(directive), `unknown directive: ${line}`);

    if (directive === "sitemap") {
      sitemaps.push(value);
    } else if (directive === "user-agent") {
      if (!current || current.rules.length) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else {
      assert.ok(current, `rule before any User-agent line: ${line}`);
      current.rules.push([directive, value]);
    }
  }
  return { groups, sitemaps };
}

function contentSignals(group: Group): Record<string, string> {
  const signals: Record<string, string> = {};
  for (const [directive, value] of group.rules) {
    if (directive !== "content-signal") continue;
    for (const pair of value.split(",")) {
      const [key = "", setting = ""] = pair.split("=").map((part) => part.trim());
      signals[key] = setting;
    }
  }
  return signals;
}

describe("public/robots.txt", async () => {
  const text = await readFile(new URL("../../public/robots.txt", import.meta.url), "utf8");
  const { groups, sitemaps } = parseRobots(text);

  it("names every required crawler in exactly one group", () => {
    for (const agent of REQUIRED_AGENTS) {
      const matches = groups.filter((group) => group.agents.includes(agent.toLowerCase()));
      assert.equal(matches.length, 1, `${agent} should be in exactly one group`);
    }
  });

  it("gives every group the same allow, disallow, and content signal rules", () => {
    for (const group of groups) {
      const label = group.agents.join(", ");
      const allows = group.rules.filter(([directive]) => directive === "allow").map(([, v]) => v);
      const disallows = group.rules
        .filter(([directive]) => directive === "disallow")
        .map(([, v]) => v);

      assert.deepEqual(allows, ["/"], `${label}: Allow`);
      assert.deepEqual(disallows, ["/api/"], `${label}: Disallow`);
      assert.deepEqual(
        contentSignals(group),
        { search: "yes", "ai-input": "yes", "ai-train": "yes" },
        `${label}: Content-Signal`,
      );
    }
  });

  it("points to the absolute sitemap URL", () => {
    assert.deepEqual(sitemaps, ["https://jgabor.se/sitemap.xml"]);
  });
});
