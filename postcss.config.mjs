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
        deep: [],
        greedy: [],
      },
      defaultExtractor: (content) => content.match(/[A-Za-z0-9_-]+/g) ?? [],
    }),
  );
}

export default { plugins };
