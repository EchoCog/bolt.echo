#!/bin/bash
# Build script for Cloudflare Pages

# Run the standard build
pnpm run build

# Create the _worker.js file for Cloudflare Pages
cat > build/client/_worker.js << 'EOF'
import { createRequestHandler } from '@remix-run/cloudflare';
import * as serverBuild from '../server/index.js';

const handler = createRequestHandler(serverBuild);

export default {
  async fetch(request, env, ctx) {
    return handler(request, env, ctx);
  },
};
EOF

echo "Build completed successfully with _worker.js file"
