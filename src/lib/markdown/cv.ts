import type { CvCopy } from "../../data/cv-copy.ts";
import { absoluteUrl, document, escapeInline, escapeParagraph, link, list } from "./format.ts";
import type { MarkdownCareerEntry } from "./home.ts";

interface CvMarkdownInput {
  site: string | URL;
  copy: CvCopy;
  career: MarkdownCareerEntry[];
}

function experienceEntry(entry: MarkdownCareerEntry): string {
  return document([
    `### ${escapeInline(entry.company)}`,
    escapeParagraph(entry.tenure),
    ...entry.roles.map((role) =>
      document([
        `#### ${escapeInline(role.title)}`,
        escapeParagraph(role.location ? `${role.period} · ${role.location}` : role.period),
        ...(role.cvDescription ?? role.description).map(escapeParagraph),
      ]).trimEnd(),
    ),
  ]).trimEnd();
}

/** Markdown version of the CV page, built from the same copy and data as the HTML and PDF. */
export function renderCvMarkdown({ site, copy, career }: CvMarkdownInput): string {
  return document([
    `# ${escapeInline(copy.name)}`,
    escapeParagraph(copy.title),
    `Location: ${escapeInline(copy.location)}`,
    list([
      ...copy.contacts.map((contact) => link(contact.label, absoluteUrl(contact.href, site))),
      link(copy.download.label, absoluteUrl(copy.download.href, site)),
    ]),

    "## Summary",
    ...copy.summary.map(escapeParagraph),
    `**${escapeInline(copy.summaryClosing)}**`,

    "## Strengths",
    list(
      copy.strengths.map(
        (strength) => `**${escapeInline(strength.title)}:** ${escapeInline(strength.description)}`,
      ),
    ),

    "## Skills",
    list(copy.skills.map(escapeInline)),

    "## Languages",
    list(copy.languages.map(escapeInline)),

    "## Experience",
    ...career.map(experienceEntry),
  ]);
}
