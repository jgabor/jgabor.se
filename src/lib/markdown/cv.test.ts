import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { cvCopy } from "../../data/cv-copy.ts";
import { prepareCareer } from "../../utils/career.ts";
import { renderCvMarkdown } from "./cv.ts";
import { escapeInline as inline, escapeParagraph as paragraph } from "./format.ts";
import type { MarkdownCareerEntry } from "./home.ts";

const SITE = "https://jgabor.se";
const REFERENCE_DATE = new Date("2026-08-16T00:00:00Z");

async function loadCareer(): Promise<MarkdownCareerEntry[]> {
  const entries = JSON.parse(
    await readFile(new URL("../../data/career.json", import.meta.url), "utf8"),
  ) as Array<Omit<MarkdownCareerEntry, "tenure"> & { order: number }>;
  return prepareCareer(entries, REFERENCE_DATE);
}

function headings(markdown: string, level: number): string[] {
  const prefix = `${"#".repeat(level)} `;
  return markdown
    .split("\n")
    .filter((line) => line.startsWith(prefix))
    .map((line) => line.slice(prefix.length));
}

describe("renderCvMarkdown", async () => {
  const career = await loadCareer();
  const markdown = renderCvMarkdown({ site: SITE, copy: cvCopy, career });

  it("starts with the name, title, location, and contacts", () => {
    assert.ok(markdown.startsWith(`# ${cvCopy.name}\n\n${cvCopy.title}\n\n`));
    assert.ok(markdown.includes(`Location: ${inline(cvCopy.location)}`));
    assert.ok(markdown.includes("[jonathan@jgabor.se](mailto:jonathan@jgabor.se)"));
    assert.ok(markdown.includes(`[${cvCopy.download.label}](${SITE}/CV-Jonathan_Gabor.pdf)`));
  });

  it("has the CV sections in page order", () => {
    assert.deepEqual(headings(markdown, 2), [
      "Summary",
      "Strengths",
      "Skills",
      "Languages",
      "Experience",
    ]);
  });

  it("includes the summary, strengths, skills, and languages", () => {
    for (const text of cvCopy.summary) assert.ok(markdown.includes(`\n${paragraph(text)}\n`));
    assert.ok(markdown.includes(`\n**${inline(cvCopy.summaryClosing)}**\n`));
    for (const strength of cvCopy.strengths) {
      assert.ok(
        markdown.includes(`- **${inline(strength.title)}:** ${inline(strength.description)}`),
      );
    }
    for (const item of [...cvCopy.skills, ...cvCopy.languages]) {
      assert.ok(markdown.includes(`\n- ${inline(item)}\n`), item);
    }
  });

  it("lists every company once under Experience", () => {
    const experience = markdown.slice(markdown.indexOf("## Experience"));
    assert.deepEqual(
      headings(experience, 3),
      career.map((entry) => inline(entry.company)),
    );
  });

  it("prefers cvDescription over description", () => {
    const withCvCopy = career.flatMap((entry) => entry.roles).filter((role) => role.cvDescription);
    assert.ok(withCvCopy.length > 0, "career.json has CV-specific copy");

    for (const entry of career) {
      for (const role of entry.roles) {
        const expected = role.cvDescription ?? role.description;
        for (const text of expected) {
          assert.ok(markdown.includes(`\n${paragraph(text)}\n`), role.title);
        }
        for (const text of role.description) {
          if (!expected.includes(text)) {
            assert.ok(!markdown.includes(paragraph(text)), `${role.title} uses web copy`);
          }
        }
        // The CV page shows only the role's own location, not the company's.
        const period = role.location ? `${role.period} · ${role.location}` : role.period;
        assert.ok(markdown.includes(`\n${paragraph(period)}\n`), `${role.title} period`);
      }
    }
  });

  it("uses absolute URLs and no HTML", () => {
    assert.doesNotMatch(markdown, /\]\((?!https:\/\/|mailto:)/, "every link is absolute");
    assert.doesNotMatch(markdown, /<\/?[a-z][^>]*>/i, "no HTML tags");
  });
});
