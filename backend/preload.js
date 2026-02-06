const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("nativeVideo", {
  getInfo: (filePath) => ipcRenderer.invoke("get-video-info", filePath),
});
