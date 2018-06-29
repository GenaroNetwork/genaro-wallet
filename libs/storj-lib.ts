import { storj } from "storj-lib";
import { ipcMain } from "electron";

export default class {
    constructor() {
        ipcMain.on("storj.lib.test", (event, id, args) => {
            //do something
            let rt = "return";
            event.sender.send(`storj.lib.test.${id}`, rt);
        });
    }
}