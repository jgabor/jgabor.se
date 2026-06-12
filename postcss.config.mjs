import tailwindcss from "@tailwindcss/postcss";
import purgecss from "@fullhuman/postcss-purgecss";

const plugins = [tailwindcss()];

if (process.env.NODE_ENV === "production") {
  plugins.push(
    purgecss({
      content: [
        "./src/**/*.{astro,ts,tsx,js,html}",
        "./public/**/*.html",
      ],
      safelist: {
        standard: [
          /^is-/,
          /^has-/,
          /^js$/,
          /^dark$/,
          /^visible$/,
          /^fade-in/,
          /^footer-reveal/,
          /^hidden$/,
          /^sr-only/,
          /^chart-col/,
          /^schematic-/,
          /^contact-/,
          /^career-/,
          /^code-/,
          /^hero-/,
          /^nav-/,
          /^solar-/,
          /^type-tag/,
          /^eyebrow/,
          /^dotted-/,
          /^portrait-/,
          /^social-/,
          /^section-/,
          /^col-/,
          /^bg-/,
          /^text-/,
          /^border-/,
        ],
        // Astro scopes component <style> blocks by appending [data-astro-cid-XXXX]
        // to every selector. The hashed attribute name never appears in any
        // content file, so PurgeCSS can't match it and would otherwise drop the
        // entire rule. A greedy match on the attribute name keeps the whole
        // selector any time the scoped data attribute is present.
        greedy: [/^data-astro-cid-[a-z0-9]+$/],
        deep: [],
      },
      defaultExtractor: (content) => content.match(/[A-Za-z0-9_-]+/g) ?? [],
    }),
  );
}

export default { plugins };
