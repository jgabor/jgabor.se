// Small markdown helpers for the page alternates at /index.md and /cv/index.md.
// Only `.ts` imports here, so the Node test runner can load these modules.

/** Escapes characters that would otherwise turn plain text into markdown or HTML. */
export function escapeInline(text: string): string {
  return text.replace(/[\\`*_[\]<>]/g, (char) => `\\${char}`);
}

/** Escapes text that starts a line, so it cannot become a heading or list item. */
export function escapeParagraph(text: string): string {
  return escapeInline(text)
    .replace(/^([#+-])(?=\s|$)/, "\\$1")
    .replace(/^(\d+)([.)])(?=\s|$)/, "$1\\$2");
}

/** Resolves a site-relative path such as `/CV-Jonathan_Gabor.pdf` to an absolute URL. */
export function absoluteUrl(href: string, site: string | URL): string {
  return new URL(href, site).href;
}

export function link(label: string, url: string): string {
  const destination = url.replace(
    /[ ()]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `[${escapeInline(label)}](${destination})`;
}

export function list(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

/** Joins non-empty blocks with blank lines and ends the document with a newline. */
export function document(blocks: Array<string | false | undefined>): string {
  return `${blocks.filter(Boolean).join("\n\n")}\n`;
}
