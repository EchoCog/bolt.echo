#!/usr/bin/env bash
# ------------------------------------------------------------------------
# Comprehensive deployment‐sanity script for bolt.echo
# Verifies toolchain versions, build output and wrangler config.
# ------------------------------------------------------------------------

set -euo pipefail

MIN_NODE="20.0.0"
MIN_PNPM="9.0.0"
MIN_WRANGLER="4.0.0"

COLOR_GREEN="\033[0;32m"
COLOR_RED="\033[0;31m"
COLOR_YELLOW="\033[0;33m"
COLOR_RESET="\033[0m"

print_ok()   { printf "${COLOR_GREEN}✅  %s${COLOR_RESET}\n" "$1"; }
print_warn() { printf "${COLOR_YELLOW}⚠️  %s${COLOR_RESET}\n" "$1"; }
print_err()  { printf "${COLOR_RED}❌  %s${COLOR_RESET}\n" "$1"; }

# ------------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------------
require_cmd() {
  command -v "$1" >/dev/null 2>&1 || { print_err "Required command '$1' not found."; exit 1; }
}

semver_ge() { # usage: semver_ge current min
  # shellcheck disable=SC2206
  local IFS=.
  local ver1=($1) ver2=($2)
  for ((i=${#ver1[@]}; i<3; i++)); do ver1[i]=0; done
  for ((i=${#ver2[@]}; i<3; i++)); do ver2[i]=0; done
  for i in 0 1 2; do
    if ((ver1[i] > ver2[i])); then return 0; fi
    if ((ver1[i] < ver2[i])); then return 1; fi
  done
  return 0
}

# ------------------------------------------------------------------------
# 1. Toolchain checks
# ------------------------------------------------------------------------
echo "🔍 Checking toolchain versions..."

require_cmd node
NODE_VER="$(node -v | sed 's/^v//')"
if semver_ge "$NODE_VER" "$MIN_NODE"; then
  print_ok "Node.js $NODE_VER (>= $MIN_NODE)"
else
  print_err "Node.js $NODE_VER is older than required $MIN_NODE"
  exit 1
fi

require_cmd pnpm
PNPM_VER="$(pnpm --version)"
if semver_ge "$PNPM_VER" "$MIN_PNPM"; then
  print_ok "pnpm $PNPM_VER (>= $MIN_PNPM)"
else
  print_err "pnpm $PNPM_VER is older than required $MIN_PNPM"
  exit 1
fi

require_cmd wrangler
# `wrangler --version` prints something like:
#   " ⛅️ wrangler 4.27.0"
# Grab the first semver-looking pattern in the output.
WRANGLER_VER="$(wrangler --version | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+' | head -n1)"
if semver_ge "$WRANGLER_VER" "$MIN_WRANGLER"; then
  print_ok "Wrangler $WRANGLER_VER (>= $MIN_WRANGLER)"
else
  print_err "Wrangler $WRANGLER_VER is older than required $MIN_WRANGLER"
  exit 1
fi

# ------------------------------------------------------------------------
# 2. Build project
# ------------------------------------------------------------------------
echo "🏗  Building project (pnpm run build:pages)..."
pnpm run build:pages
print_ok "Build command finished"

# ------------------------------------------------------------------------
# 3. Validate build artefacts
# ------------------------------------------------------------------------
echo "🔍 Validating build artefacts..."

if [[ ! -d "build/client" ]]; then
  print_err "build/client directory missing"
  exit 1
fi
print_ok "build/client directory exists"

if [[ ! -f "build/client/_headers" ]]; then
  print_warn "_headers file missing (optional but recommended for CF headers)"
else
  print_ok "_headers file found"
fi

if [[ -d "build/client/assets" ]]; then
  ASSET_COUNT=$(find build/client/assets -type f | wc -l)
  print_ok "assets directory exists with $ASSET_COUNT files"
else
  print_err "assets directory missing"
  exit 1
fi

# Ensure server bundle exists (needed by functions/[[path]].ts)
if [[ ! -f "build/server/index.js" ]]; then
  print_err "Server bundle build/server/index.js not found"
  exit 1
fi
print_ok "Server bundle exists"

# ------------------------------------------------------------------------
# 4. Wrangler configuration validation
# ------------------------------------------------------------------------
echo "🔍 Validating wrangler configuration..."

# Ensure wrangler.toml is present
if [[ -f "wrangler.toml" ]]; then
  print_ok "wrangler.toml found"
else
  print_err "wrangler.toml is missing"
  exit 1
fi

# Check for authentication token (warn if absent)
if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  print_warn "CLOUDFLARE_API_TOKEN is not set. Real deployments will require authentication."
else
  print_ok "CLOUDFLARE_API_TOKEN detected"
fi

# ------------------------------------------------------------------------
# 5. Summary
# ------------------------------------------------------------------------
echo -e "\n${COLOR_GREEN}🎉 All checks passed. Your Cloudflare Pages configuration looks good!${COLOR_RESET}"
echo "Next steps:"
echo "  1) Authenticate with 'wrangler login' (or ensure API token env vars are set)."
echo "  2) Deploy for real with: pnpm run deploy"
