import type { APIRoute } from "astro";
import { cvCopy } from "../../data/cv-copy";
import { getCareer } from "../../lib/career";
import { renderCvMarkdown } from "../../lib/markdown/cv";
import { MARKDOWN_CONTENT_TYPE } from "../../lib/markdown/negotiation";

// Built to /cv/index.md. The Worker serves it for `/cv/` when a request asks for markdown.
export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("Set `site` in astro.config.mjs to render absolute URLs.");
  const career = await getCareer();

  return new Response(renderCvMarkdown({ site, copy: cvCopy, career }), {
    headers: { "Content-Type": MARKDOWN_CONTENT_TYPE },
  });
};
