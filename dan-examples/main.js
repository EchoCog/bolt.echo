import { app, BrowserWindow, ipcMain, shell as systemShell, powerMonitor, protocol, Menu } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
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

process.on('uncaughtException', (err) => {
  console.error('[shell] uncaughtException:', err);
});

// Mitigate potential GPU driver crashes on Windows (0xC0000005)
try {
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch('disable-gpu');
  app.commandLine.appendSwitch('no-sandbox');
  app.commandLine.appendSwitch('in-process-gpu');
  app.commandLine.appendSwitch('disable-gpu-compositing');
} catch {}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#111111',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Minimal load path: local HTML only (no ports, no dev server)
  mainWindow.loadFile(path.join(__dirname, 'index.html')).catch(() => {
    mainWindow.loadURL(
      'data:text/html;charset=UTF-8,' +
        encodeURIComponent('<!doctype html><html><body><h3>Shell Ready</h3></body></html>'),
    );
  });

  mainWindow.webContents.on('render-process-gone', (_e, details) => {
    console.warn('[shell] renderer gone:', details);
  });
  mainWindow.webContents.on('unresponsive', () => console.warn('[shell] window unresponsive'));

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

  // Minimal mode: no local HTTP server
  console.log('[shell] minimal mode: no local HTTP server');
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


