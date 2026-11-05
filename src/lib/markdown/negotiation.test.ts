import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import {
  MARKDOWN_ALTERNATES,
  MARKDOWN_CONTENT_TYPE,
  negotiatePage,
  prefersMarkdown,
} from "./negotiation.ts";

const BROWSER_ACCEPT =
  "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";

describe("prefersMarkdown", () => {
  const cases: Array<[accept: string | null, expected: boolean]> = [
    [null, false],
    ["", false],
    [BROWSER_ACCEPT, false],
    ["*/*", false],
    ["text/*", false],
    ["text/html", false],
    ["text/markdown", true],
    ["TEXT/MARKDOWN", true],
    ["text/markdown; charset=utf-8", true],
    ["text/markdown, text/html;q=0.9", true],
    ["text/markdown, */*", true],
    ["text/html, text/markdown", true],
    ["text/plain, text/markdown;q=0.5", true],
    ["text/html, text/markdown;q=0.9", false],
    ["text/markdown;q=0.5, text/*;q=0.8", false],
    ["text/markdown;q=0", false],
    ["text/markdown;q=abc", false],
    ["text/markdown;q=0.5, text/html;q=0.1, */*;q=1", true],
  ];

  for (const [accept, expected] of cases) {
    it(`${JSON.stringify(accept)} -> ${expected ? "markdown" : "html"}`, () => {
      assert.equal(prefersMarkdown(accept), expected);
    });
  }
});

interface FakeVariant {
  status?: number;
  headers?: Record<string, string>;
}

function fakeFetch(variant: FakeVariant = {}) {
  const requests: Request[] = [];
  const fetchVariant = async (request: Request) => {
    requests.push(request);
    const isMarkdown = new URL(request.url).pathname.endsWith(".md");
    const status = variant.status ?? 200;
    const hasBody = status !== 304 && request.method !== "HEAD";
    return new Response(hasBody ? (isMarkdown ? "# Page" : "<!doctype html>") : null, {
      status,
      headers: {
        "Content-Type": isMarkdown ? "application/octet-stream" : "text/html",
        ...variant.headers,
      },
    });
  };
  return { requests, fetchVariant };
}

function get(path: string, headers: Record<string, string> = {}, method = "GET") {
  return new Request(`https://jgabor.se${path}`, { method, headers });
}

describe("negotiatePage", () => {
  it("serves HTML with a Link to the markdown version by default", async () => {
    const { requests, fetchVariant } = fakeFetch();
    const response = await negotiatePage(get("/", { Accept: BROWSER_ACCEPT }), fetchVariant);

    assert.ok(response);
    assert.equal(requests[0]?.url, "https://jgabor.se/");
    assert.equal(response.headers.get("Content-Type"), "text/html");
    assert.equal(
      response.headers.get("Link"),
      '</index.md>; rel="alternate"; type="text/markdown"',
    );
    assert.equal(response.headers.get("Vary"), "Accept");
  });

  it("serves markdown when the request asks for it", async () => {
    const { requests, fetchVariant } = fakeFetch();
    const response = await negotiatePage(get("/", { Accept: "text/markdown" }), fetchVariant);

    assert.ok(response);
    assert.equal(requests[0]?.url, "https://jgabor.se/index.md");
    assert.equal(await response.text(), "# Page");
    assert.equal(response.headers.get("Content-Type"), MARKDOWN_CONTENT_TYPE);
    assert.equal(response.headers.get("Link"), null);
    assert.equal(response.headers.get("Vary"), "Accept");
  });

  it("maps /cv/ to /cv/index.md", async () => {
    const { requests, fetchVariant } = fakeFetch();
    const markdown = await negotiatePage(get("/cv/", { Accept: "text/markdown" }), fetchVariant);
    const html = await negotiatePage(get("/cv/"), fetchVariant);

    assert.equal(requests[0]?.url, "https://jgabor.se/cv/index.md");
    assert.equal(markdown?.headers.get("Content-Type"), MARKDOWN_CONTENT_TYPE);
    assert.equal(
      html?.headers.get("Link"),
      '</cv/index.md>; rel="alternate"; type="text/markdown"',
    );
  });

  it("supports HEAD and forwards conditional headers to the variant", async () => {
    const { requests, fetchVariant } = fakeFetch({ status: 304 });
    const response = await negotiatePage(
      get("/", { Accept: "text/markdown", "If-None-Match": '"abc"' }, "HEAD"),
      fetchVariant,
    );

    assert.equal(requests[0]?.method, "HEAD");
    assert.equal(requests[0]?.headers.get("If-None-Match"), '"abc"');
    assert.equal(response?.status, 304);
    assert.equal(response?.headers.get("Content-Type"), MARKDOWN_CONTENT_TYPE);
  });

  it("does not label error responses", async () => {
    const { fetchVariant } = fakeFetch({ status: 404 });
    const markdown = await negotiatePage(get("/", { Accept: "text/markdown" }), fetchVariant);
    const html = await negotiatePage(get("/"), fetchVariant);

    assert.equal(markdown?.status, 404);
    assert.notEqual(markdown?.headers.get("Content-Type"), MARKDOWN_CONTENT_TYPE);
    assert.equal(html?.headers.get("Link"), null);
    assert.equal(markdown?.headers.get("Vary"), "Accept");
  });

  it("keeps existing Vary and Link values", async () => {
    const { fetchVariant } = fakeFetch({
      headers: { Vary: "Accept-Encoding", Link: '<https://jgabor.se/>; rel="canonical"' },
    });
    const response = await negotiatePage(get("/"), fetchVariant);

    assert.equal(response?.headers.get("Vary"), "Accept-Encoding, Accept");
    assert.equal(
      response?.headers.get("Link"),
      '<https://jgabor.se/>; rel="canonical", </index.md>; rel="alternate"; type="text/markdown"',
    );
  });

  it("passes on other paths and methods", async () => {
    const { requests, fetchVariant } = fakeFetch();

    assert.equal(await negotiatePage(get("/", {}, "POST"), fetchVariant), undefined);
    assert.equal(await negotiatePage(get("/api/contact"), fetchVariant), undefined);
    assert.equal(await negotiatePage(get("/cv"), fetchVariant), undefined);
    assert.equal(await negotiatePage(get("/index.md"), fetchVariant), undefined);
    assert.equal(requests.length, 0);
  });
});

// Removes // and /* */ comments and trailing commas outside strings.
function parseJsonc(text: string): unknown {
  const strip = (source: string, skip: (rest: string) => number) => {
    let out = "";
    let inString = false;
    for (let i = 0; i < source.length; i++) {
      const char = source[i];
      if (inString) {
        out += char;
        if (char === "\\") out += source[++i] ?? "";
        else if (char === '"') inString = false;
        continue;
      }
      if (char === '"') inString = true;
      const skipped = skip(source.slice(i));
      if (skipped) {
        i += skipped - 1;
        continue;
      }
      out += char;
    }
    return out;
  };

  const withoutComments = strip(text, (rest) => {
    if (rest.startsWith("//")) return rest.includes("\n") ? rest.indexOf("\n") : rest.length;
    if (rest.startsWith("/*")) return rest.indexOf("*/") + 2;
    return 0;
  });
  const withoutTrailingCommas = strip(withoutComments, (rest) => (/^,\s*[}\]]/.test(rest) ? 1 : 0));
  return JSON.parse(withoutTrailingCommas);
}

describe("Worker routing config", async () => {
  const wrangler = parseJsonc(
    await readFile(new URL("../../../wrangler.jsonc", import.meta.url), "utf8"),
  ) as { main?: string; assets?: { binding?: string; run_worker_first?: string[] } };

  it("runs the Worker first for exactly the pages with a markdown version", () => {
    assert.equal(wrangler.main, "./src/worker.ts");
    assert.equal(wrangler.assets?.binding, "ASSETS");
    assert.deepEqual(
      [...(wrangler.assets?.run_worker_first ?? [])].sort(),
      Object.keys(MARKDOWN_ALTERNATES).sort(),
    );
  });

  it("has a markdown endpoint for every alternate", async () => {
    for (const markdownPath of Object.values(MARKDOWN_ALTERNATES)) {
      await access(new URL(`../../pages${markdownPath}.ts`, import.meta.url));
    }
  });
});
