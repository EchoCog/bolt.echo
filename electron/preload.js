import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('shell', {
  getSetting: (key) => ipcRenderer.invoke('settings:get', key),
  setSetting: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  getSecret: (key) => ipcRenderer.invoke('settings:getSecret', key),
  setSecret: (key, val) => ipcRenderer.invoke('settings:setSecret', key, val),
  llmStream: (payload) => ipcRenderer.invoke('llm:stream', payload),
  onDeepLink: (cb) => ipcRenderer.on('deeplink', (_e, url) => cb(url)),
  openSettings: () => ipcRenderer.invoke('settings:open'),
});
