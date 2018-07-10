import { ipcMain, dialog } from "electron";
import { execFile } from 'child_process';
import { BC_LOG_FILE, BC_ERR_FILE, BC_STORAGE_PATH, WEB3_CONFIG, PLATFORM, BC_EXISTS_FILE, WEB3_URL, GENARO_ROOT_PATH } from "./config";
import { appendFileSync, writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";
import { Observable } from "rxjs";
const GETH = join(__dirname, "geth", `geth-${PLATFORM}`);
const GETH_CONFIG_FILE = join(__dirname, "geth", "config.json");
let configFile = readFileSync(GETH_CONFIG_FILE);
let GETH_CONFIG = join(GENARO_ROOT_PATH, "block.config.json");

export default class {
    holdingenv: any = {};
    initBC() {
        return new Promise(res => {
            writeFileSync(GETH_CONFIG, configFile);
            let initCLI = execFile(GETH, [
                "init",
                GETH_CONFIG,
                "--datadir",
                BC_STORAGE_PATH,
            ], {
                    maxBuffer: Infinity,
                });
            initCLI.stdout.on("data", data => {
                data;
            });
            initCLI.on("close", () => {
                writeFileSync(BC_EXISTS_FILE, "done");
                res();
            });
        });
    }

    startBC() {
        return new Promise(res => {
            let startCLI = execFile(GETH, [
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
                "--syncmode",
                "full",
            ], {
                    maxBuffer: Infinity,
                });
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

    runJS(js, id) {
        return new Observable(ob => {
            let jsCLI = execFile(GETH, [
                "attach",
                WEB3_URL], {
                    maxBuffer: Infinity,
                });
            this.holdingenv[`${id}`] = jsCLI;
            let started = false;
            let inputed = false
            let ended = false;
            jsCLI.stdout.on('data', (data) => {
                if (data.toString().indexOf(">") > -1 && started) ended = true;
                if (data.toString().indexOf(">") > -1 && !started) started = true;
                if (!started) return;
                if (ended) {
                    jsCLI.stdin.write("exit;\n");
                    return;
                }
                if (!inputed) {
                    inputed = true;
                    jsCLI.stdin.write(`${js}\n`);
                    return;
                }
                ob.next(data.toString());
            });
            jsCLI.on("close", (code) => {
                ob.complete();
            });
        });
    }

    endJS(id) {
        let jsCLI = this.holdingenv[`${id}`];
        jsCLI.kill();
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
                    this.initBC().then(res);
                } else {
                    res();
                }
            })
                .then(() => {
                    return this.startBC();
                })
                .then(() => {
                    event.sender.send(`geth.startBC.${id}`);
                });
        });
        ipcMain.on("geth.runJS", (event, id, js) => {
            this.runJS(js, id).subscribe(data => {
                event.sender.send(`geth.runJS.${id}`, data);
            },
                err => { },
                () => {
                    event.sender.send(`geth.runJS.${id}.end`);
                }
            )
        });

        ipcMain.on("geth.endJS", (event, id) => {
            this.endJS(id);
        });
    }
}