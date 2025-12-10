export function minifyCSS(css: string): string {
  return (
    css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, "")
      // Collapse whitespace
      .replace(/\s+/g, " ")
      // Remove space around special chars
      .replace(/\s*([{}:;,>+~])\s*/g, "$1")
      // Shorten hex colors: #ffffff → #fff
      .replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g, "#$1$2$3")
      // Remove trailing semicolons before }
      .replace(/;}/g, "}")
      // Remove leading/trailing whitespace
      .trim()
  );
}

export function minifyHTML(html: string): string {
  return (
    html
      // Remove HTML comments (but preserve conditional comments)
      .replace(/<!--(?!\[)[\s\S]*?-->/g, "")
      // Collapse whitespace between tags
      .replace(/>\s+</g, "><")
      // Collapse whitespace within text nodes (preserve single space)
      .replace(/\s+/g, " ")
      // Remove whitespace around block tags
      .replace(/\s*(<\/?(?:html|head|body|div|p|br|hr|style|script)[^>]*>)\s*/gi, "$1")
      // Minify inline CSS
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (match, css) => {
        return match.replace(css, minifyCSS(css));
      })
      .trim()
  );
}
