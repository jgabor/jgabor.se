import { appendFile, readFile } from "node:fs/promises";

const [logPath] = process.argv.slice(2);
const log = await readFile(logPath, "utf8").catch((error) => {
  if (error.code === "ENOENT") return "";
  throw error;
});
const status = log.match(/\[code-feed\] status=(live|snapshot|failed)\b/)?.[1];
const descriptions = {
  live: "Live GitHub activity fetched successfully.",
  snapshot: "Snapshot fallback used. GitHub feed unavailable; see the build log for details.",
  failed:
    "Live GitHub feed required but unavailable. Deployment skipped; see the build log for details.",
};

if (status === "snapshot") {
  console.log(`::warning title=Code feed fallback::${descriptions.snapshot}`);
} else if (status === "failed") {
  console.log(
    "::error title=Code feed refresh failed::Live GitHub feed unavailable. Deployment skipped.",
  );
}

await appendFile(
  process.env.GITHUB_STEP_SUMMARY,
  "## Code feed and deployment\n\n" +
    `**Code feed:** ${descriptions[status] ?? "No feed status reported by the build."}\n\n` +
    `**Build:** ${process.env.BUILD_OUTCOME || "Not run"}\n\n` +
    `**Deployment:** ${process.env.DEPLOY_OUTCOME || "Not run"}\n`,
);
