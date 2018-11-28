import { ipcMain } from "electron";
import { autoUpdater } from "electron-updater";

let sender = null;
let send = (name, ...args) => {
    if (!sender) return;
    sender.send(name, ...args);
}

export class AutoUpdate {
    constructor() {
        ipcMain.once("app.loaded.lang", (event, ipcId) => {
            if (!sender) sender = event.sender;
            autoUpdater.checkForUpdates();
        });
        ipcMain.on("app.update.check", (event, ipcId) => {
            if (!sender) sender = event.sender;
            autoUpdater.checkForUpdates();
        });
        ipcMain.on("app.update.download", (event, ipcId) => {
            if (!sender) sender = event.sender;
            autoUpdater.downloadUpdate();
        });
        ipcMain.on("app.update.install", (event, ipcId) => {
            if (!sender) sender = event.sender;
            autoUpdater.quitAndInstall();
        });
        autoUpdater.on("error", (err) => {
            send("ipc.event", "app.update.error", err.message);
        });
        autoUpdater.on("update-available", () => {
            send("ipc.event", "app.update.available");
        });
        autoUpdater.on("update-not-available", () => {
            send("ipc.event", "app.update.notavailable");
        });
        autoUpdater.on("download-progress", () => {
            send("ipc.event", "app.update.downloading");
        });
        autoUpdater.on("update-downloaded", () => {
            send("ipc.event", "app.update.downloaded");
        });

    }
}