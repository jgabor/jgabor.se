import { brotliCompressSync, constants } from "node:zlib";

export type Encoding = "zstd" | "br" | "gzip" | "raw";

export interface CompressedVariants {
  zstd: Uint8Array;
  br: Uint8Array;
  gzip: Uint8Array;
  raw: Uint8Array;
}

export function compressAll(content: string): CompressedVariants {
  const raw = new TextEncoder().encode(content);

  return {
    zstd: Bun.zstdCompressSync(raw, { level: 19 }),
    br: brotliCompressSync(raw, {
      params: {
        [constants.BROTLI_PARAM_QUALITY]: constants.BROTLI_MAX_QUALITY,
      },
    }),
    gzip: Bun.gzipSync(raw, { level: 9 }),
    raw,
  };
}

export function getContentEncoding(encoding: Encoding): string | null {
  switch (encoding) {
    case "zstd":
      return "zstd";
    case "br":
      return "br";
    case "gzip":
      return "gzip";
    case "raw":
      return null;
  }
}
