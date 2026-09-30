type Runtime = import("@astrojs/cloudflare").Runtime;

declare namespace Cloudflare {
  interface Env {
    FASTMAIL_TOKEN: string;
  }
}

declare namespace App {
  interface Locals extends Runtime {}
}
