import type { HomeCopy } from "../../data/home-copy.ts";
import type { CodeEntry } from "../github/code-feed.ts";
import { absoluteUrl, document, escapeInline, escapeParagraph, link, list } from "./format.ts";

export interface MarkdownCareerEntry {
  company: string;
  tenure: string;
  location?: string;
  roles: Array<{
    title: string;
    period: string;
    location?: string;
    description: string[];
    cvDescription?: string[];
  }>;
}

interface HomeMarkdownInput {
  site: string | URL;
  copy: HomeCopy;
  code: CodeEntry[];
  career: MarkdownCareerEntry[];
}

function sectionHeading(section: { eyebrow: string; title: string }): string {
  return `## ${escapeInline(section.eyebrow)}: ${escapeInline(section.title)}`;
}

function codeEntry(entry: CodeEntry): string {
  const title = entry.url ? link(entry.title, entry.url) : escapeInline(entry.title);
  return document([
    `### ${title}`,
    list([`Type: ${escapeInline(entry.type)}`, `Tags: ${entry.tags.map(escapeInline).join(", ")}`]),
    entry.description && escapeParagraph(entry.description),
  ]).trimEnd();
}

function careerEntry(entry: MarkdownCareerEntry): string {
  return document([
    `### ${escapeInline(entry.company)}`,
    escapeParagraph(entry.tenure),
    ...entry.roles.map((role) => {
      const location = role.location ?? entry.location;
      return document([
        `#### ${escapeInline(role.title)}`,
        escapeParagraph(location ? `${role.period} · ${location}` : role.period),
        ...role.description.map(escapeParagraph),
      ]).trimEnd();
    }),
  ]).trimEnd();
}

/** Markdown version of the homepage, built from the same copy and data as the HTML. */
export function renderHomeMarkdown({ site, copy, code, career }: HomeMarkdownInput): string {
  const links = list(copy.links.map((item) => link(item.label, absoluteUrl(item.href, site))));

  return document([
    `# ${escapeInline(copy.name)}`,
    escapeParagraph(copy.hero.tagline),
    escapeParagraph(copy.hero.intro),
    `Location: ${escapeInline(copy.hero.location)}`,
    links,

    sectionHeading(copy.code),
    escapeParagraph(copy.code.subtitle),
    ...code.map(codeEntry),

    sectionHeading(copy.career),
    escapeParagraph(copy.career.subtitle),
    "### Strengths",
    list(
      copy.career.strengths.map(
        (strength) => `**${escapeInline(strength.title)}:** ${escapeInline(strength.description)}`,
      ),
    ),
    "### Skills",
    list(copy.career.skills.map(escapeInline)),
    ...career.map(careerEntry),

    sectionHeading(copy.contact),
    escapeParagraph(copy.contact.subtitle),
    `Send a message with the contact form at ${link("jgabor.se/#contact", absoluteUrl("/#contact", site))}. ${escapeInline(copy.contact.replyNote)}.`,
    links,
  ]);
}
