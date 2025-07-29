# Workers for Platforms

Extend the capabilities of Cloudflare Workers to customers of your SaaS applications and deploy serverless functions on their behalf. This guide shows how to set up a dispatch namespace, upload a user Worker, and create a dispatch Worker.

## 1. Create a dispatch namespace

```bash
npx wrangler dispatch-namespace create staging
```

Authenticate Wrangler with your Cloudflare account if prompted.

## 2. Upload a user Worker

Create a Worker project and deploy it to the namespace:

```bash
npm create cloudflare@latest customer-worker-1 -- --type=hello-world
cd customer-worker-1
wrangler deploy --dispatch-namespace staging
```

## 3. Create a dispatch Worker

Back out of the user Worker directory and scaffold a dispatch Worker:

```bash
cd ..
npm create cloudflare@latest my-dispatcher -- --type=hello-world
cd my-dispatcher
```

Add the dispatch namespace binding to `wrangler.toml`:

```toml
[[dispatch_namespaces]]
binding = "dispatcher"
namespace = "<NAMESPACE_NAME>"
```

Update `index.js` to forward requests to the user Worker:

```javascript
export default {
  async fetch(req, env) {
    const worker = env.dispatcher.get("customer-worker-1");
    return worker.fetch(req);
  }
}
```

## 4. Deploy

```bash
npx wrangler deploy
```

## 5. Test

Send a request to your dispatch Worker:

```bash
curl https://my-dispatcher.<YOUR_WORKERS_SUBDOMAIN>.workers.dev/
```

You should receive the "Hello world" response from `customer-worker-1`.

For more details, refer to the official Cloudflare [Workers for Platforms documentation](https://developers.cloudflare.com/workers/platforms/).
