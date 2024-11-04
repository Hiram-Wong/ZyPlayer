import { contextBridge } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
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
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
  // @ts-ignore (define in dts)
  window.removeLoading = removeLoading;
}
