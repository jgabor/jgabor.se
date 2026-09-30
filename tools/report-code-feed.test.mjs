import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it } from "node:test";

async function report(t, log, buildOutcome = "success", deployOutcome = "success") {
  const directory = await mkdtemp(join(tmpdir(), "code-feed-report-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const logPath = join(directory, "build.log");
  const summaryPath = join(directory, "summary.md");
  if (log !== null) await writeFile(logPath, log);
  const output = execFileSync(process.execPath, ["tools/report-code-feed.mjs", logPath], {
    encoding: "utf8",
    env: {
      ...process.env,
      GITHUB_STEP_SUMMARY: summaryPath,
      BUILD_OUTCOME: buildOutcome,
      DEPLOY_OUTCOME: deployOutcome,
    },
  });
  return { output, summary: await readFile(summaryPath, "utf8") };
}

it("warns about fallback while reporting a successful deployment", async (t) => {
  const { output, summary } = await report(
    t,
    "[code-feed] status=snapshot\nError: GitHub GraphQL failed: 401 Unauthorized\n",
  );
  assert.match(output, /::warning title=Code feed fallback::/);
  assert.match(summary, /Snapshot fallback used/);
  assert.match(summary, /\*\*Deployment:\*\* success/);
});

it("reports a strict feed failure and skipped deployment", async (t) => {
  const { output, summary } = await report(t, "[code-feed] status=failed\n", "failure", "skipped");
  assert.match(output, /::error title=Code feed refresh failed::/);
  assert.match(summary, /\*\*Build:\*\* failure/);
  assert.match(summary, /\*\*Deployment:\*\* skipped/);
});

it("reports live data without masking a deployment failure", async (t) => {
  const { output, summary } = await report(t, "[code-feed] status=live\n", "success", "failure");
  assert.equal(output, "");
  assert.match(summary, /Live GitHub activity fetched successfully/);
  assert.match(summary, /\*\*Deployment:\*\* failure/);
});

it("reports a build failure without inventing a feed result", async (t) => {
  const { summary } = await report(t, "Unrelated Astro build error\n", "failure", "skipped");
  assert.match(summary, /No feed status reported/);
  assert.match(summary, /\*\*Build:\*\* failure/);
});

it("reports steps skipped before the build log exists", async (t) => {
  const { summary } = await report(t, null, "skipped", "skipped");
  assert.match(summary, /No feed status reported/);
  assert.match(summary, /\*\*Build:\*\* skipped/);
});
