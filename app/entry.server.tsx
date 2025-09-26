import type { AppLoadContext, EntryContext } from '@remix-run/cloudflare';
import { RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import { renderHeadToString } from 'remix-island';
import { Head } from './root';
import ReactDOMServer from 'react-dom/server';

const { renderToReadableStream } = ReactDOMServer;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  _loadContext: AppLoadContext,
) {
  try {
    const head = renderHeadToString({ request, remixContext, Head });

    // Prefer edge/web streams if available; otherwise fallback to Node pipeable stream
    const maybeRenderToReadableStream: unknown = (ReactDOMServer as unknown as Record<string, unknown>)
      .renderToReadableStream;

    if (typeof maybeRenderToReadableStream === 'function') {
      const renderToReadableStream = maybeRenderToReadableStream as (
        node: React.ReactElement,
        options?: { signal?: AbortSignal; onError?: (error: unknown) => void },
      ) => ReadableStream<Uint8Array> & { allReady?: Promise<void> };

      const readable = await renderToReadableStream(<RemixServer context={remixContext} url={request.url} />, {
        signal: request.signal,
        onError(error: unknown) {
          console.error(error);
          responseStatusCode = 500;
        },
      });

      const body = new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(
            new Uint8Array(
              new TextEncoder().encode(
                `<!DOCTYPE html><html lang="en" data-theme="light"><head>${head}</head><body><div id="root" class="w-full h-full">`,
              ),
            ),
          );

          const reader = readable.getReader();

          function read() {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  controller.enqueue(new Uint8Array(new TextEncoder().encode(`</div></body></html>`)));
                  controller.close();

                  return;
                }

                if (value) {
                  controller.enqueue(value);
                }

                read();
              })
              .catch((error) => {
                controller.error(error);
              });
          }
          read();
        },
      });

      if (isbot(request.headers.get('user-agent') || '')) {
        // allReady may exist on some builds; check at runtime safely
        const anyReadable = readable as unknown as { allReady?: Promise<void> };

        if (anyReadable.allReady) {
          await anyReadable.allReady;
        }
      }

      responseHeaders.set('Content-Type', 'text/html');
      responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
      responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

      return new Response(body, { headers: responseHeaders, status: responseStatusCode });
    }

    // Fallback for Node builds: renderToPipeableStream
    const maybeRenderToPipeableStream: unknown = (ReactDOMServer as unknown as Record<string, unknown>)
      .renderToPipeableStream;

    if (typeof maybeRenderToPipeableStream === 'function') {
      const { PassThrough } = await import('node:stream');
      const { Readable } = await import('node:stream');
      const renderToPipeableStream = maybeRenderToPipeableStream as (
        node: React.ReactElement,
        options: { onShellReady?: () => void; onAllReady?: () => void; onError?: (e: unknown) => void },
      ) => { pipe: (writable: NodeJS.WritableStream) => void };

      const shell = new PassThrough();
      const footer = new PassThrough();
      const body = new PassThrough();

      body.write(
        `<!DOCTYPE html><html lang="en" data-theme="light"><head>${head}</head><body><div id="root" class="w-full h-full">`,
      );

      const { pipe } = renderToPipeableStream(<RemixServer context={remixContext} url={request.url} />, {
        onShellReady() {
          pipe(shell);
        },
        onError(error: unknown) {
          console.error(error);
          responseStatusCode = 500;
        },
      });

      shell.on('data', (chunk) => body.write(chunk));
      shell.on('end', () => {
        footer.end('</div></body></html>');
      });
      footer.on('data', (chunk) => body.write(chunk));
      footer.on('end', () => body.end());

      const webBody = Readable.toWeb(body) as unknown as ReadableStream<Uint8Array>;

      responseHeaders.set('Content-Type', 'text/html');
      responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
      responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');

      return new Response(webBody, { headers: responseHeaders, status: responseStatusCode });
    }

    // Last-resort static HTML fallback
    const minimal = `<!DOCTYPE html><html lang="en" data-theme="light"><head>${head}</head><body><div id="root" class="w-full h-full"><noscript>App loaded without SSR</noscript></div></body></html>`;
    responseHeaders.set('Content-Type', 'text/html');

    return new Response(minimal, { headers: responseHeaders, status: responseStatusCode });
  } catch (error) {
    console.error(error);

    const minimal =
      '<!doctype html><html><head><meta charset="utf-8"/><title>Fallback</title></head><body><div id="root">Fallback UI</div></body></html>';
    responseHeaders.set('Content-Type', 'text/html');

    return new Response(minimal, { headers: responseHeaders, status: 200 });
  }
}
