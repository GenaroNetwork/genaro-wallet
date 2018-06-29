import { storj } from "storj-lib";
import { ipcMain } from "electron";

export default class {
    constructor() {
        ipcMain.on("storj.lib.test", (event, ...args) => {

        });
    }
}