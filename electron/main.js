import { app, BrowserWindow, ipcMain, shell as systemShell, powerMonitor, protocol, Menu } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import Store from 'electron-store';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store({ name: 'settings' });
const SERVICE_NAME = 'boltecho';

let mainWindow;
let viteDev;
let localLLMServer;
let llamaProc = null;

// Ensure custom protocol is registered before app is ready
try {
  protocol.registerSchemesAsPrivileged?.([
    { scheme: 'boltecho', privileges: { secure: true, standard: true } },
  ]);
} catch (err) {
  console.warn('[shell] protocol registration warning:', err);
}

// Avoid process exit on unhandled rejections during dev
process.on('unhandledRejection', (reason) => {
  console.warn('[shell] unhandledRejection:', reason);
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const url = process.env.BOLTECHO_URL || 'http://localhost:5174';
  const fallbackHttp = 'http://localhost:8788/';

  let loaded = false;
  mainWindow.webContents.once('did-finish-load', () => {
    loaded = true;
  });
  mainWindow.webContents.on('did-fail-load', () => {
    if (!loaded) {
      try {
        mainWindow.loadURL(fallbackHttp);
      } catch {}
    }
  });
  // Try dev server first; if it doesn't load quickly, fallback to local build
  mainWindow
    .loadURL(url)
    .catch(() => {
      try {
        mainWindow.loadURL(fallbackHttp);
      } catch {}
    });
  setTimeout(() => {
    if (!loaded) {
      try {
        mainWindow.loadURL(fallbackHttp);
      } catch {}
    }
  }, 2500);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function setupMenu() {
  try {
    const template = [
      {
        label: 'App',
        submenu: [
          { label: 'Settings', accelerator: 'Ctrl+,', click: () => createSettingsWindow() },
          { type: 'separator' },
          { label: 'Reload', accelerator: 'Ctrl+R', click: () => mainWindow?.webContents.reload() },
          { label: 'Toggle DevTools', accelerator: 'Ctrl+Shift+I', click: () => mainWindow?.webContents.toggleDevTools() },
          { type: 'separator' },
          { role: 'quit' },
        ],
      },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  } catch (e) {
    console.warn('[shell] failed to set menu', e);
  }
}

function createSettingsWindow() {
  const win = new BrowserWindow({
    width: 620,
    height: 560,
    resizable: false,
    title: 'Settings',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.removeMenu?.();
  win.loadFile(path.join(__dirname, 'settings.html'));
}

async function isHttpOk(url) {
  try {
    const resp = await fetch(url, { method: 'GET' });
    return resp.ok;
  } catch {
    return false;
  }
}

async function ensureLlamaServer() {
  const enabled = store.get('llama.enabled');
  if (enabled === false) return false;

  const llamaBinaryPath = store.get('llama.binaryPath');
  const modelPath = store.get('llama.modelPath');
  const port = Number(store.get('llama.port') ?? 8791);
  const host = '127.0.0.1';

  if (!llamaBinaryPath || !modelPath) {
    return false;
  }

  const healthUrl = `http://${host}:${port}/health`;
  if (await isHttpOk(healthUrl)) return true;

  try {
    const args = [
      '--server',
      '--api',
      '--host', host,
      '--port', String(port),
      '--n-gpu-layers', String(store.get('llama.nGpuLayers') ?? 0),
      '--ctx-size', String(store.get('llama.ctx') ?? 2048),
      '--model', modelPath,
    ];

    console.log('[shell] starting llama.cpp:', llamaBinaryPath, args.join(' '));
    llamaProc = spawn(llamaBinaryPath, args, { stdio: 'pipe' });
    llamaProc.stdout.on('data', (d) => process.stdout.write(`[llama] ${d}`));
    llamaProc.stderr.on('data', (d) => process.stderr.write(`[llama] ${d}`));
    llamaProc.on('exit', (code) => {
      console.warn('[shell] llama exited with code', code);
      llamaProc = null;
    });
  } catch (e) {
    console.warn('[shell] failed to start llama.cpp', e);
    return false;
  }

  const start = Date.now();
  while (Date.now() - start < 8000) {
    if (await isHttpOk(healthUrl)) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

async function getSecret(key) {
  try {
    const mod = await import('keytar');
    const keytar = mod.default ?? mod;
    return await keytar.getPassword(SERVICE_NAME, key);
  } catch {
    // Fallback when keytar is unavailable in dev or not built
    return store.get(`__secret__${key}`) || process.env[key] || null;
  }
}

async function setSecret(key, value) {
  try {
    const mod = await import('keytar');
    const keytar = mod.default ?? mod;
    await keytar.setPassword(SERVICE_NAME, key, value);
    return true;
  } catch {
    store.set(`__secret__${key}`, value);
    return true;
  }
}

async function getApiKey() {
  return (await getSecret('ANTHROPIC_API_KEY')) || store.get('ANTHROPIC_API_KEY') || process.env.ANTHROPIC_API_KEY;
}

async function ensureLocalServers() {
  // Start Remix+Vite dev if not already provided
  if (!process.env.BOLTECHO_URL && process.env.START_DEV === '1') {
    try {
      viteDev = spawn(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['dev', '--', '--host', '--port', '5174'], {
        cwd: path.join(__dirname, '..'),
        shell: process.platform === 'win32',
      });
      viteDev.stdout?.on('data', (d) => process.stdout.write(`[vite] ${d}`));
      viteDev.stderr?.on('data', (d) => process.stderr.write(`[vite] ${d}`));
      process.on('exit', () => viteDev && viteDev.kill());
    } catch (e) {
      console.warn('[shell] failed to spawn dev server, continuing with static UI', e);
    }
  } else if (!process.env.BOLTECHO_URL) {
    console.log('[shell] START_DEV not set; skipping dev server spawn');
  }

  // Minimal local fallback API (synchronous/basic)
  const appSrv = express();
  appSrv.use(express.json());

  // Settings endpoints
  appSrv.get('/api.local/settings', (_req, res) => {
    res.json({
      anthropicKey: !!(store.get('__secret__ANTHROPIC_API_KEY') || process.env.ANTHROPIC_API_KEY),
      llama: {
        enabled: store.get('llama.enabled') ?? true,
        binaryPath: store.get('llama.binaryPath') ?? '',
        modelPath: store.get('llama.modelPath') ?? '',
        port: store.get('llama.port') ?? 8791,
        ctx: store.get('llama.ctx') ?? 2048,
        nGpuLayers: store.get('llama.nGpuLayers') ?? 0,
      },
    });
  });
  appSrv.post('/api.local/settings', (req, res) => {
    const { llama, anthropicKey } = req.body || {};
    if (typeof anthropicKey === 'string' && anthropicKey.length > 3) {
      store.set('__secret__ANTHROPIC_API_KEY', anthropicKey);
    }
    if (llama && typeof llama === 'object') {
      for (const k of ['enabled', 'binaryPath', 'modelPath', 'port', 'ctx', 'nGpuLayers']) {
        if (k in llama) store.set(`llama.${k}`, llama[k]);
      }
    }
    res.json({ ok: true });
  });
  appSrv.post('/api.local/chat', async (req, res) => {
    try {
      const { messages } = req.body || { messages: [] };
      let answer = null;
      // Try local llama first
      try {
        const ok = await ensureLlamaServer();
        if (ok) {
          const port = Number(store.get('llama.port') ?? 8791);
          const resp = await fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              model: 'local-gguf',
              messages,
              temperature: 0.6,
              stream: false,
              max_tokens: 512,
            }),
          });
          const data = await resp.json();
          answer = data?.choices?.[0]?.message?.content || null;
        }
      } catch (e) {
        console.warn('[shell] llama local error', e);
      }

      if (!answer) answer = basicFallback(messages);
      res.json({ id: Date.now().toString(), role: 'assistant', content: answer });
    } catch (e) {
      res.json({ id: Date.now().toString(), role: 'assistant', content: 'OK.' });
    }
  });
  const port = process.env.BOLTECHO_LOCAL_API_PORT || 8788;

  // Serve built client as a local static site so Electron can load over http
  try {
    const clientDir = path.join(__dirname, '..', 'build', 'client');
    const manifestPath = path.join(clientDir, '.vite', 'manifest.json');
    if (fs.existsSync(clientDir) && fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      const entry = Object.values(manifest).find((m) =>
        m && typeof m === 'object' && (m.file?.includes('entry.client') || m.src?.includes('entry.client'))
      );
      if (entry && typeof entry === 'object' && entry.file) {
        const entryFile = String(entry.file);
        const cssFiles = Array.isArray(entry.css) ? entry.css : [];
        appSrv.use(express.static(clientDir));
        const html = '<!doctype html>' +
          '<html lang="en" data-theme="light">' +
          '<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>' +
          cssFiles.map((h) => `<link rel="stylesheet" href="/${h}">`).join('') +
          '</head><body><div id="root" class="w-full h-full"></div>' +
          `<script type="module" src="/${entryFile}"></script>` +
          '</body></html>';
        appSrv.get('*', (_req, res) => res.type('html').send(html));
        console.log('[shell] serving local UI from', clientDir);
      } else {
        console.log('[shell] entry.client not found in manifest, UI static fallback disabled');
      }
    } else {
      console.log('[shell] build/client not found, UI static fallback disabled');
    }
  } catch (e) {
    console.warn('[shell] static serving setup failed', e);
  }

  appSrv.listen(port, () => console.log(`[shell] local api listening on :${port}`));
}

function basicFallback(messages) {
  const last = Array.isArray(messages) && messages.length ? messages[messages.length - 1].content : '';
  const onBattery = powerMonitor ? powerMonitor.onBatteryPower : false;
  const prefix = onBattery ? '[low-power] ' : '';
  return `${prefix}I received your request${last ? `: ${truncate(last, 160)}` : ''}.`;
}

function truncate(s, n) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

app.whenReady().then(async () => {
  await ensureLocalServers();
  createWindow();
  app.setAsDefaultProtocolClient('boltecho');
});

app.on('open-url', (_e, url) => {
  // route deeplink to renderer
  mainWindow?.webContents.send('deeplink', url);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('settings:get', (_e, key) => store.get(key));
ipcMain.handle('settings:set', (_e, key, value) => store.set(key, value));
ipcMain.handle('settings:getSecret', async (_e, key) => getSecret(key));
ipcMain.handle('settings:setSecret', async (_e, key, val) => setSecret(key, val));
ipcMain.handle('settings:open', () => createSettingsWindow());

ipcMain.handle('llm:stream', async (_e, payload) => {
  // Placeholder to switch to cloud/local inference later
  // For now call local basic endpoint to guarantee a response
  try {
    const resp = await fetch('http://localhost:8788/api.local/chat', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload),
    });
    return await resp.json();
  } catch (e) {
    return { role: 'assistant', content: 'OK.' };
  }
});


