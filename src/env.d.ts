/// <reference path="../.astro/types.d.ts" />

type Runtime = import("@astrojs/cloudflare").Runtime<{
  SITE: KVNamespace;
  FASTMAIL_TOKEN: string;
}>;

declare namespace App {
  interface Locals extends Runtime {}
}
