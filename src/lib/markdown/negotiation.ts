// Accept negotiation between a page and its markdown version.
// Only `.ts` imports here, so the Node test runner can load this module.

/**
 * Pages with a markdown version, keyed by pathname.
 * Keep `assets.run_worker_first` in wrangler.jsonc in sync with these keys.
 */
export const MARKDOWN_ALTERNATES: Readonly<Record<string, string>> = {
  "/": "/index.md",
  "/cv/": "/cv/index.md",
};

export const MARKDOWN_CONTENT_TYPE = "text/markdown; charset=utf-8";

interface MediaRange {
  type: string;
  q: number;
}

function parseAccept(header: string): MediaRange[] {
  const ranges: MediaRange[] = [];
  for (const part of header.split(",")) {
    const [rawType = "", ...params] = part.split(";");
    const type = rawType.trim().toLowerCase();
    if (!type) continue;

    let q = 1;
    for (const param of params) {
      const [name = "", value] = param.split("=");
      if (name.trim().toLowerCase() === "q") q = Number(value?.trim());
    }
    if (!Number.isFinite(q)) continue;
    ranges.push({ type, q: Math.min(Math.max(q, 0), 1) });
  }
  return ranges;
}

function quality(ranges: MediaRange[], type: string): number | undefined {
  let best: number | undefined;
  for (const range of ranges) {
    if (range.type === type) best = Math.max(best ?? 0, range.q);
  }
  return best;
}

/**
 * True when the client names `text/markdown` with q > 0 and rates it at least
 * as high as HTML. HTML's rating comes from the most specific of `text/html`,
 * `text/*`, or `*\/*`. Browsers never name `text/markdown`, so they get HTML.
 */
export function prefersMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  const ranges = parseAccept(accept);
  const markdown = quality(ranges, "text/markdown");
  if (!markdown) return false;

  const html =
    quality(ranges, "text/html") ?? quality(ranges, "text/*") ?? quality(ranges, "*/*") ?? 0;
  return markdown >= html;
}

function isSuccess(status: number): boolean {
  return (status >= 200 && status < 300) || status === 304;
}

/**
 * Serves the HTML or markdown variant of a page in MARKDOWN_ALTERNATES.
 * Returns undefined for other paths and for methods other than GET and HEAD.
 */
export async function negotiatePage(
  request: Request,
  fetchVariant: (request: Request) => Promise<Response>,
): Promise<Response | undefined> {
  if (request.method !== "GET" && request.method !== "HEAD") return undefined;

  const url = new URL(request.url);
  if (!Object.hasOwn(MARKDOWN_ALTERNATES, url.pathname)) return undefined;
  const markdownPath = MARKDOWN_ALTERNATES[url.pathname];

  const wantsMarkdown = prefersMarkdown(request.headers.get("Accept"));
  const variant = wantsMarkdown ? new Request(new URL(markdownPath, url), request) : request;
  const upstream = await fetchVariant(variant);

  // Asset responses have immutable headers, so copy before editing.
  const response = new Response(upstream.body, upstream);
  response.headers.append("Vary", "Accept");

  if (isSuccess(response.status)) {
    if (wantsMarkdown) {
      response.headers.set("Content-Type", MARKDOWN_CONTENT_TYPE);
    } else {
      response.headers.append("Link", `<${markdownPath}>; rel="alternate"; type="text/markdown"`);
    }
  }
  return response;
}
