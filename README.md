# jgabor.se

Personal portfolio site deployed as a Cloudflare Worker.

## Setup

```sh
bun install
cp .dev.vars.example .dev.vars  # add FASTMAIL_TOKEN
```

Create `wrangler.toml` with your KV namespace IDs:

```toml
[[kv_namespaces]]
binding = "SITE"
id = "<your-kv-namespace-id>"
preview_id = "<your-preview-kv-namespace-id>"
```

## Development

```sh
bun run dev
```

## Deploy

```sh
bun run deploy
```
