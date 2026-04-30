/// <reference path="../.astro/types.d.ts" />
/// <reference types="@cloudflare/workers-types" />

type Runtime = import("@astrojs/cloudflare").Runtime;

declare namespace Cloudflare {
  interface Env {
    SITE: KVNamespace;
    FASTMAIL_TOKEN: string;
  }
}

declare namespace App {
  interface Locals extends Runtime {}
}
