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

## GitHub Actions setup

The workflow deploys on push to `main`. Add these secrets in **Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | Create at [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) with "Edit Cloudflare Workers" template |
| `CLOUDFLARE_ACCOUNT_ID` | Found in Workers & Pages → Overview (right sidebar) |
| `KV_NAMESPACE_ID` | Your production KV namespace ID |
