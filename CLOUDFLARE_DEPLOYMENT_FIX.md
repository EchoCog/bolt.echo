# Cloudflare Deployment Fix Guide

## Issue Summary
The Cloudflare Pages deployment is failing because it's configured to run `npx wrangler versions upload` which is an incorrect command for Pages deployment. This command is for Workers, not Pages.

## Root Cause
The error occurs because someone has configured a custom deploy command in the Cloudflare Pages dashboard that overrides the default Pages deployment process.

## Solution Steps

### 1. Fix the Cloudflare Dashboard Configuration

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages** > **bolt-echo** (or boltecho)
3. Go to **Settings** > **Builds & deployments**
4. Look for **Build commands** or **Deploy command** section
5. **Remove** the custom deploy command `npx wrangler versions upload`
6. Either:
   - Leave the deploy command empty (recommended)
   - Or set it to: `npx wrangler pages deploy build/client --project-name boltecho`

### 2. Verify Build Configuration

Ensure the following settings are correct in the Cloudflare dashboard:

- **Build command**: `pnpm run build:pages` or `pnpm run build`
- **Build output directory**: `build/client`
- **Root directory**: `/` (or leave empty)
- **Environment variables**:
  - `NODE_VERSION`: `20.15.1`
  - `ANTHROPIC_API_KEY`: Your API key
  - `VITE_LOG_LEVEL`: `debug` or `info`

### 3. Local Testing

To test the deployment locally:

```bash
# Build the project
pnpm run build:pages

# Test the deployment command
npx wrangler pages deploy build/client --project-name boltecho
```

### 4. Updated Configuration Files

The following files have been updated:

1. **package.json**: Updated wrangler to version 4.25.0
2. **wrangler.toml**: Added `main = "worker.js"` entry point

### 5. Alternative: GitHub Actions Deployment

If the Cloudflare dashboard deployment continues to fail, use the GitHub Actions workflow:

```bash
# Trigger the deployment workflow manually
# Go to GitHub > Actions > "Deploy Cloudflare Pages with Wrangler" > Run workflow
```

## Verification

After making these changes:

1. Trigger a new deployment (push to main or manually trigger)
2. Check the build logs - you should NOT see `npx wrangler versions upload`
3. The deployment should use the standard Pages deployment process

## Additional Notes

- Cloudflare Pages does NOT support `wrangler.toml` for deployment configuration
- The `wrangler versions upload` command is for Workers, not Pages
- Pages uses a different deployment mechanism that handles routing automatically