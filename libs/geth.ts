import { ipcMain } from "electron";
import { spawn } from 'child_process';
import { BC_LOG_FILE, BC_ERR_FILE, BC_STORAGE_PATH, WEB3_CONFIG, PLATFORM, BC_EXISTS_FILE, WEB3_URL } from "./../src/app/libs/config";
import { appendFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
const GETH = join(__dirname, "geth", `geth-${PLATFORM}`);
const GETH_CONFIG = join(__dirname, "geth", "config.json")

export default class {
    initBC() {
        return new Promise(res => {
            let initCLI = spawn(GETH, [
                "init",
                GETH_CONFIG,
                "--datadir",
                BC_STORAGE_PATH,
            ]);
            initCLI.on("close", () => {
                writeFileSync(BC_EXISTS_FILE, "done");
                //writeFileSync(BC_LOG_FILE, "done");
                //writeFileSync(BC_ERR_FILE, "done");
            });
            initCLI.on("close", () => res);
        });
    }

    startBC() {
        return new Promise(res => {
            let startCLI = spawn(GETH, [
                "--datadir",
                BC_STORAGE_PATH,
                /*"--rpc",
                "--rpcaddr",
                WEB3_CONFIG.RPC_ADDR,
                "--rpcport",
                WEB3_CONFIG.RPC_PORT,*/
                "--ws",
                "--wsaddr",
                WEB3_CONFIG.WS_ADDR,
                "--wsport",
                WEB3_CONFIG.WS_PORT,
                "--wsorigins",
                WEB3_CONFIG.WS_ORIGINS,
                "--wsapi",
                WEB3_CONFIG.WS_API,
            ]);
            let started = false;
            startCLI.stdout.on("data", (data) => {
                appendFileSync(BC_LOG_FILE, data);
                if (started) return;
                if (data.toString().indexOf(WEB3_URL) > -1) {
                    started = true;
                    res();
                };
            });
            startCLI.stderr.on("data", (data) => {
                appendFileSync(BC_ERR_FILE, data);
                if (started) return;
                if (data.toString().indexOf(WEB3_URL) > -1) {
                    started = true;
                    res();
                };
            });
        });
    }

    runJS(js) {
        return new Promise(res => {
            let jsCLI = spawn(GETH, [
                "attach",
                WEB3_URL]);
            let done = false;
            jsCLI.stdout.on('data', (data) => {
                if (done) jsCLI.stdin.write("exit;\n");
                if (data.toString().indexOf(">") === -1) return;
                done = true;
                jsCLI.stdin.write(js);
            });
            jsCLI.on("close", () => {
                res();
            });
        });
    }

    constructor() {
        ipcMain.on("geth.initBC", (event, id) => {
            this.initBC().then(() => {
                event.sender.send(`geth.initBC.${id}`);
            })
        });
        ipcMain.on("geth.startBC", (event, id) => {
            new Promise(res => {
                if (!existsSync(BC_EXISTS_FILE)) {
                    this.initBC().then(() => res);
                }
                res();
            })
                .then(() => {
                    return this.startBC();
                })
                .then(() => {
                    event.sender.send(`geth.startBC.${id}`);
                });
        });
        ipcMain.on("geth.runJS", (event, id, js) => {
            this.runJS(js).then(() => {
                event.sender.send(`geth.runJS.${id}`);
            })
        });
    }
}