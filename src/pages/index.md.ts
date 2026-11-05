import type { APIRoute } from "astro";
import { homeCopy } from "../data/home-copy";
import { getCareer } from "../lib/career";
import { getHomeCodeEntries } from "../lib/github/home-code-entries";
import { renderHomeMarkdown } from "../lib/markdown/home";
import { MARKDOWN_CONTENT_TYPE } from "../lib/markdown/negotiation";

// Built to /index.md. The Worker serves it for `/` when a request asks for markdown.
export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("Set `site` in astro.config.mjs to render absolute URLs.");
  const [code, career] = await Promise.all([getHomeCodeEntries(), getCareer()]);

  return new Response(renderHomeMarkdown({ site, copy: homeCopy, code, career }), {
    headers: { "Content-Type": MARKDOWN_CONTENT_TYPE },
  });
};
