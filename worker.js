import { createRequestHandler } from '@remix-run/cloudflare';
import * as build from './build/server';

const handleRemixRequest = createRequestHandler(build, process.env.NODE_ENV);

export default {
  async fetch(request, env, ctx) {
    if ((request.method === 'GET' || request.method === 'HEAD') && env.APP_ASSETS?.fetch) {
      const assetRequest = new Request(request);
      assetRequest.headers.delete('if-none-match');

      try {
        const assetResponse = await env.APP_ASSETS.fetch(assetRequest.url, assetRequest);

        if (assetResponse && assetResponse.status >= 200 && assetResponse.status < 400) {
          return assetResponse;
        }
      } catch {
        // fall through to Remix request handling when the asset lookup misses
      }
    }

    return handleRemixRequest(request, {
      cloudflare: {
        env,
        cf: request.cf,
        ctx,
        caches,
      },
    });
  },
};
