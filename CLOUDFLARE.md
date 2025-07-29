# Cloudflare Architecture

## Overview
The application is split into three components:

1. **Frontend (Cloudflare Pages)**
   - URL: https://9313c63a.bolt-echo.pages.dev
   - Hosts the static web application
   - Built from: `build/client` directory
   - Status: Currently returning 404 (needs environment variables)

2. **Main Worker (bolt-echo)**
   - Primary API endpoint
   - Handles main application logic
   - Communicates with Anthropic API
   - Status: Active

3. **Tail Worker (bolt-echo-tail)**
   - URL: https://bolt-echo-tail.echocog.workers.dev
   - Handles streaming responses
   - Works alongside the main worker
   - Status: Active

## How They Work Together
1. Users access the frontend through Cloudflare Pages
2. Frontend makes API calls to the main Worker
3. For streaming operations (like chat):
   - Main worker initiates the request
   - Tail worker handles the streaming response
   - Frontend receives real-time updates

## Required Environment Variables
The following environment variables must be set in Cloudflare Pages:

1. `ANTHROPIC_API_KEY`
   - Required for API communication
   - Must be a valid Anthropic API key

2. `VITE_LOG_LEVEL`
   - Controls application logging
   - Recommended value: `debug`

## How to Set Environment Variables
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Pages > bolt-echo > Settings > Environment variables
3. Add both required variables:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key from https://console.anthropic.com/
   - `VITE_LOG_LEVEL`: Set to `debug` for development or `info` for production
4. Trigger a new deployment

## Project Configuration
- Build command: `pnpm run build`
- Build output directory: `build/client`
- Node.js version: 20.15.1
- Package manager: pnpm@9.4.0
- Framework: Remix with Cloudflare Pages Functions

## Custom Domains
- Production: bolt.echocog.org
- Preview: staging.echocog.org

## Useful Links
- Main Worker Dashboard: https://dash.cloudflare.com/d1fcd8dbbd35aec43e5499200f6baede/workers/services/view/bolt-echo/production
- Tail Worker Dashboard: https://dash.cloudflare.com/d1fcd8dbbd35aec43e5499200f6baede/workers/services/view/bolt-echo-tail/production
