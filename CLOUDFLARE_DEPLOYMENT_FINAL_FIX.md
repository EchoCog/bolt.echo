# Cloudflare Deployment – Final Fix Guide 🚀

This document captures **everything you need** to ship `bolt.echo` to **Cloudflare Pages + Workers** confidently.

---

## 1. Issues Found & Fixed

| # | Problem | Resolution |
|---|---------|------------|
| 1 | **Out-of-date Wrangler** (v3.101) caused missing-entrypoint errors. | Upgraded to **Wrangler v4.27.0** (`pnpm add -D wrangler@latest`). |
| 2 | Wrong command `wrangler versions upload` (Workers-only) used in CI/CD. | Replaced with `wrangler pages deploy build/client --project-name boltecho`. |
| 3 | Mixed Pages/Workers config in `wrangler.toml`. | Simplified: removed `main`, added `[pages]`, `pages_build_output_dir`, and centralised build command. |
| 4 | Pages build used **npm** instead of **pnpm**. | Updated `.cloudflare/pages.toml` to `corepack enable && pnpm install --frozen-lockfile && pnpm run build:pages`. |
| 5 | GitHub Actions used Node 18, missing pnpm setup, and old wrangler. | New workflow installs Node 20, pnpm 9.4, Wrangler 4, then builds and deploys. |
| 6 | No reproducible local test. | Added `deploy-test.sh` to lint toolchain, build, validate artefacts & config. |
| 7 | Large client chunks warning. | Left as optimisation note; does **not** block deployment. |

All fixes have been validated via local builds and the **deploy-test** script.

---

## 2. Current Working Configuration

### `wrangler.toml`
```
name = "boltecho"
compatibility_date = "2024-08-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "build/client"

[pages]
output_directory = "build/client"

[build]
command = "pnpm run build:pages"
```

### `.cloudflare/pages.toml`
```
[build]
command          = "corepack enable && pnpm install --frozen-lockfile && pnpm run build:pages"
output_directory = "build/client"
base_directory   = "."
root_directory   = "."
```

### `package.json` (scripts)
```json
"scripts": {
  "build":        "remix vite:build --force",
  "build:pages":  "./build-pages.sh",
  "deploy":       "pnpm run build:pages && wrangler pages deploy build/client --project-name boltecho",
  "start":        "pnpm run bindings && wrangler pages dev ./build/client"
}
```

### GitHub Actions (`.github/workflows/deploy-pages.yml`)
* Runs on push to `main` or manual trigger.
* Steps: Checkout → Node 20 → pnpm 9.4 → Install deps → Install Wrangler 4 → `pnpm run build:pages` → `wrangler pages deploy build/client --project-name boltecho`.

---

## 3. Step-by-Step Deployment

### A. One-time setup
1. **Create a Cloudflare Pages project** named **`boltecho`** (connect GitHub repo or manual).  
2. Generate an **API token** with *Account > Pages / Workers Writes* and add it to GitHub repo secrets:  
   * `CLOUDFLARE_API_TOKEN`  
   * `CLOUDFLARE_ACCOUNT_ID`  

### B. GitHub Actions (recommended)
```bash
git push origin main         # CI builds & deploys automatically
```
Monitor progress in the Actions tab and Cloudflare Pages dashboard.

### C. Manual CLI
```bash
# Authenticate once
npx wrangler login

# Build & deploy
pnpm run deploy
```
Tip: to deploy a preview branch:
```bash
wrangler pages deploy build/client --project-name boltecho --branch my-feature
```

---

## 4. Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `Missing entry-point` | Old Wrangler v3 | `pnpm i -D wrangler@latest` |
| `wrangler: unknown argument dry-run` | `--dry-run` not supported | Remove flag (use preview branch for test) |
| Build fails on Pages with `pnpm` not found | `pages.toml` missing `corepack enable` | Ensure config snippet above is present |
| 403 Unauthorized | Token missing or wrong scope | Regenerate API token with **Pages Write** & **Account Workers Write** |
| Large JS chunks warning | Bundle size > 500 kB | Add dynamic `import()` or manual chunking (optional) |

---

## 5. Testing Procedures

1. **Local sanity check**
   ```bash
   ./deploy-test.sh
   ```
   • Verifies Node, pnpm, Wrangler versions  
   • Builds client & server bundles  
   • Checks artefacts in `build/`  
   • Ensures `wrangler.toml` present and token variable (optional).

2. **Preview deployment**
   ```bash
   git checkout -b preview-test
   git push -u origin preview-test
   # Or CLI:
   wrangler pages deploy build/client --project-name boltecho --branch preview-test
   ```

3. **Smoke test**
   * Open the preview URL → ensure landing page loads.  
   * API routes (handled by `functions/[[path]].ts`) should return 200.

---

## 6. Next Steps

1. **Monitoring & logs**  
   * Enable *Pages Insights* and *Workers Logpush* to observe traffic & errors.

2. **Performance tuning**  
   * Address large chunk warnings by code-splitting.  
   * Consider `cache-control` headers via `_headers` file.

3. **Staging environment**  
   * Use a protected branch & separate Cloudflare environment (`--branch staging`).

4. **Automated tests**  
   * Integrate `vitest` + Playwright to run before deploy.

5. **Infrastructure as Code**  
   * Optional: commit `wrangler.toml` secrets to Cloudflare *`wrangler secret put`* for KV, D1, etc.

With these fixes and this guide, **`bolt.echo` is ready for seamless, repeatable deployments on Cloudflare Pages & Workers. Happy shipping! ✈️
