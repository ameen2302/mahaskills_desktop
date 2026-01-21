const { contextBridge, ipcRenderer } = require("electron");
const electron = require("electron");

const API = {
  requestAppPath: (msg) => ipcRenderer.send("request-app-path", msg),
  getAppPath: (callback) => {
    ipcRenderer.on("send-app-path", (_event, arg) => callback(arg));
  },
  download: (url, filename, directory) =>
    ipcRenderer.send("download", {
      payload: {
        url: url,
        properties: {
          filename: filename,
          directory: directory,
        },
      },
    }),
  makeDir: (id) => ipcRenderer.send("make-dir", id),
  onDownloadComplete: () =>
    ipcRenderer.on("download-complete", (_event, arg) => arg),
  requestPdfContent: (filename) =>
    ipcRenderer.send("request-pdf-content", filename),
  receivePdfContent: (callback) =>
    ipcRenderer.once("receive-pdf-content", (event, arg) => callback(arg)),
  requestVideoContent: (filename) =>
    ipcRenderer.send("request-video-content", filename),
  receiveVideoContent: (callback) =>
    ipcRenderer.once("receive-video-content", (event, arg) => callback(arg)),
  requestThumbContent: (filename, callback) => {
    ipcRenderer
      .invoke("request-thumb-content", filename)
      .then((arg) => callback(arg));
  },
  requestContent: (filename) => ipcRenderer.send("request-content", filename),
  receiveContent: (callback) =>
    ipcRenderer.once("receive-content", (event, arg) => callback(arg)),
  saveFile: (filename, b64Str) =>
    ipcRenderer.send("save-file", filename, b64Str),
  requestFreeDiskSpace: () => ipcRenderer.send("request-free-disk-space"),
  getFreeDiskSpace: (callback) =>
    ipcRenderer.once("get-free-disk-space", (event, arg) => callback(arg)),
  saveZip: (bundleId, zipFilename) =>
    ipcRenderer.send("save-zip", bundleId, zipFilename),
  zipped: (callback) =>
    ipcRenderer.once("zipped", (event, arg) => callback(arg)),
  copyZip: (bundleId, bundleName, isGuest) =>
    ipcRenderer.send("copy-zip", bundleId, bundleName, isGuest),
  extracting: (callback) =>
    ipcRenderer.once("extracting", (event, arg) => callback(arg)),
  receiveCurriculum: (callback) =>
    ipcRenderer.once("receive-curriculum", (event, ...arg) => callback(...arg)),
  removeCourse: (bundleId) => ipcRenderer.send("remove-course", bundleId),
  error: (callback) => ipcRenderer.once("error", (event, msg) => callback(msg)),
  message: (callback) =>
    ipcRenderer.once("message", (event, msg) => callback(msg)),
};

contextBridge.exposeInMainWorld("api", API);
