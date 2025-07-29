import { createRequestHandler } from '@remix-run/cloudflare';
import * as serverBuild from './build/server';

const handler = createRequestHandler(serverBuild);

export default {
  async fetch(request, env, ctx) {
    return handler(request, env, ctx);
  },
};