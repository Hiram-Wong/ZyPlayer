// import process from 'node:process';

import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge } from 'electron';

import { domReady } from './utils/dom';
import { useLoading } from './utils/loading';

const { appendLoading, removeLoading } = useLoading();

domReady().then(appendLoading);

// Custom APIs for renderer
const api = {};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
    contextBridge.exposeInMainWorld('removeLoading', removeLoading);
  } catch (error) {
    console.error('[Preload]Failed to expose APIs:', error as Error);
  }
} else {
  window.electron = electronAPI;
  window.api = api;
  window.removeLoading = removeLoading;
}

export type WindowApiType = typeof api;
