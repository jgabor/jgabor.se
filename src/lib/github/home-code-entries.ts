import codeOverrides from "../../data/code-overrides.json";
import { buildCodeEntries, type CodeEntry } from "./code-feed";

let cached: Promise<CodeEntry[]> | undefined;

function load(): Promise<CodeEntry[]> {
  return buildCodeEntries({
    username: "jgabor",
    overrides: codeOverrides,
    minEntries: 8,
    requireLive: import.meta.env.CODE_FEED_REQUIRE_LIVE === "true",
  });
}

/**
 * Code entries for the homepage and /index.md.
 *
 * A build fetches once and shares the result, so both outputs match and the
 * build log has one `[code-feed] status=` line. Dev fetches on every request.
 */
export function getHomeCodeEntries(): Promise<CodeEntry[]> {
  if (import.meta.env.DEV) return load();
  cached ??= load();
  return cached;
}
