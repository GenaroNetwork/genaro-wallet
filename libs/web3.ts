
import { WEB3_URL, LITE_WALLET } from "../libs/config";
import { ipcMain } from "electron";

let Web3 = require("genaro-web3");
import { GethLib } from "./geth";

ipcMain.on("web3-start", (event) => {
    let web3 = new Web3(WEB3_URL);
    web3.eth.net.isListening()
        .then(() => {
            event.sender.send("web3-started");
        })
        .catch(e => {
            // web3 is not connected
            if (LITE_WALLET) {
                // is lite wallet
                throw new Error("Can not connect to mordred.");
            }

            GethLib.startGeth().then(() => {
                event.sender.send("web3-started");
            });

        });
});

export class Web3Lib {
    constructor() { }
}
