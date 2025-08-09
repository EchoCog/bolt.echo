import { app, BrowserWindow, ipcMain, shell as systemShell, powerMonitor, protocol } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import Store from 'electron-store';
import Keytar from 'keytar';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const store = new Store({ name: 'settings' });
const SERVICE_NAME = 'boltecho';

let mainWindow;
let viteDev;
let localLLMServer;

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
  mainWindow.loadURL(url);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function getApiKey() {
  return (await Keytar.getPassword(SERVICE_NAME, 'ANTHROPIC_API_KEY')) || store.get('ANTHROPIC_API_KEY');
}

async function ensureLocalServers() {
  // Start Remix+Vite dev if not already provided
  if (!process.env.BOLTECHO_URL) {
    viteDev = spawn(process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm', ['dev', '--', '--host', '--port', '5174'], {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
    });
    process.on('exit', () => viteDev && viteDev.kill());
  }

  // Minimal local fallback API (synchronous/basic)
  const appSrv = express();
  appSrv.use(express.json());
  appSrv.post('/api.local/chat', async (req, res) => {
    try {
      const { messages } = req.body || { messages: [] };
      const answer = basicFallback(messages);
      res.json({ id: Date.now().toString(), role: 'assistant', content: answer });
    } catch (e) {
      res.json({ id: Date.now().toString(), role: 'assistant', content: 'OK.' });
    }
  });
  const port = process.env.BOLTECHO_LOCAL_API_PORT || 8788;
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
  protocol.registerSchemesAsPrivileged?.([
    { scheme: 'boltecho', privileges: { secure: true, standard: true } },
  ]);

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
ipcMain.handle('settings:getSecret', async (_e, key) => Keytar.getPassword(SERVICE_NAME, key));
ipcMain.handle('settings:setSecret', async (_e, key, val) => Keytar.setPassword(SERVICE_NAME, key, val));

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


