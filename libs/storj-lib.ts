import { ipcMain } from "electron";
const storj = require("storj-lib");
const genaroshare = require("genaroshare-daemon");

export default class {
    constructor() {
        ipcMain.on("storj.lib.getPrivateKey", (event, args) => {
            event.returnValue = storj.KeyPair().getPrivateKey();
        });

        ipcMain.on("storj.lib.getNodeID", (event, args) => {
            event.returnValue = storj.KeyPair(args[0]).getNodeID();
        });

        ipcMain.on("storj.lib.validateConfig", (event, args) => {
            try {
                genaroshare.utils.validate(args[0]);
                return event.returnValue = '';
            }
            catch (e) {
                return event.returnValue = e;
            }
        });
    }
}