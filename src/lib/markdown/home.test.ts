import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import snapshot from "../../data/code.snapshot.json" with { type: "json" };
import { homeCopy } from "../../data/home-copy.ts";
import { prepareCareer } from "../../utils/career.ts";
import type { CodeEntry } from "../github/code-feed.ts";
import { escapeInline as inline, escapeParagraph as paragraph, link } from "./format.ts";
import { renderHomeMarkdown, type MarkdownCareerEntry } from "./home.ts";

const SITE = "https://jgabor.se";
const REFERENCE_DATE = new Date("2026-08-16T00:00:00Z");

async function loadCareer(): Promise<Array<MarkdownCareerEntry & { order: number }>> {
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

describe("renderHomeMarkdown", async () => {
  const career = await loadCareer();
  const code = snapshot as CodeEntry[];
  const markdown = renderHomeMarkdown({ site: SITE, copy: homeCopy, code, career });

  it("starts with the name, tagline, intro, and location", () => {
    assert.ok(markdown.startsWith(`# ${homeCopy.name}\n\n${homeCopy.hero.tagline}\n\n`));
    assert.ok(markdown.includes(`\n${paragraph(homeCopy.hero.intro)}\n`));
    assert.ok(markdown.includes(`Location: ${inline(homeCopy.hero.location)}`));
  });

  it("has one section per page section, in page order", () => {
    assert.deepEqual(headings(markdown, 2), [
      `${homeCopy.code.eyebrow}: ${homeCopy.code.title}`,
      `${homeCopy.career.eyebrow}: ${homeCopy.career.title}`,
      `${homeCopy.contact.eyebrow}: ${homeCopy.contact.title}`,
    ]);
  });

  it("links every code entry title", () => {
    for (const entry of code) {
      assert.ok(entry.url, `${entry.id} has a URL`);
      assert.ok(markdown.includes(`### ${link(entry.title, entry.url)}\n`), entry.title);
      assert.ok(markdown.includes(paragraph(entry.description)), `${entry.title} description`);
      assert.ok(
        markdown.includes(`- Tags: ${entry.tags.map(inline).join(", ")}`),
        `${entry.title} tags`,
      );
    }
  });

  it("lists every strength and skill", () => {
    for (const strength of homeCopy.career.strengths) {
      assert.ok(
        markdown.includes(`- **${inline(strength.title)}:** ${inline(strength.description)}`),
      );
    }
    for (const skill of homeCopy.career.skills) {
      assert.ok(markdown.includes(`\n- ${inline(skill)}\n`), skill);
    }
  });

  it("lists every company once, in display order, with tenure and roles", () => {
    const companyHeadings = career.map((entry) => inline(entry.company));
    assert.deepEqual(
      headings(markdown, 3).filter((heading) => companyHeadings.includes(heading)),
      companyHeadings,
    );
    assert.deepEqual(
      career.map((entry) => entry.order),
      career.map((entry) => entry.order).sort((a, b) => a - b),
    );

    for (const entry of career) {
      assert.ok(
        markdown.includes(`### ${inline(entry.company)}\n\n${paragraph(entry.tenure)}\n`),
        entry.company,
      );
      for (const role of entry.roles) {
        assert.ok(markdown.includes(`#### ${inline(role.title)}\n`), role.title);
        const location = role.location ?? entry.location;
        const period = location ? `${role.period} · ${location}` : role.period;
        assert.ok(markdown.includes(`\n${paragraph(period)}\n`), `${role.title} period`);
        for (const text of role.description) {
          assert.ok(markdown.includes(`\n${paragraph(text)}\n`), role.title);
        }
      }
    }
  });

  it("ends with the contact section and its links", () => {
    const contact = markdown.slice(markdown.indexOf(`## ${homeCopy.contact.eyebrow}`));
    assert.ok(contact.includes(`[jgabor.se/#contact](${SITE}/#contact)`));
    assert.ok(contact.includes(inline(homeCopy.contact.replyNote)));
    for (const item of homeCopy.links) {
      assert.ok(contact.includes(link(item.label, new URL(item.href, SITE).href)));
    }
  });

  it("uses absolute URLs, no HTML, and no email address", () => {
    assert.doesNotMatch(markdown, /\]\((?!https:\/\/)/, "every link is absolute https");
    assert.doesNotMatch(markdown, /<\/?[a-z][^>]*>/i, "no HTML tags");
    assert.doesNotMatch(markdown, /mailto:|@jgabor\.se/, "the homepage shows no email address");
    assert.ok(markdown.endsWith("\n") && !markdown.endsWith("\n\n"));
  });

  it("escapes markdown and HTML in data", () => {
    const tricky = renderHomeMarkdown({
      site: SITE,
      copy: { ...homeCopy, name: "A*B_C" },
      code: [
        {
          id: "x",
          title: "[x]",
          type: "`t`",
          description: "<script>alert(1)</script>",
          tags: ["a|b"],
        },
      ],
      career: [
        {
          company: "# Co",
          tenure: "1 year",
          roles: [{ title: "Lead", period: "Jan 2020 - Present", description: ["- not a list"] }],
        },
      ],
    });

    assert.ok(tricky.startsWith("# A\\*B\\_C\n"));
    assert.ok(tricky.includes("### \\[x\\]\n"), "unlinked title is escaped");
    assert.ok(tricky.includes("- Type: \\`t\\`"));
    assert.ok(tricky.includes("\\<script\\>alert(1)\\</script\\>"));
    assert.doesNotMatch(tricky, /<script>/);
    assert.ok(tricky.includes("### # Co\n"), "heading text keeps a literal #");
    assert.ok(tricky.includes("\n\\- not a list\n"), "paragraph cannot become a list");
  });
});
