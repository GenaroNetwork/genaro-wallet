import { ipcMain } from "electron";
import { spawn } from 'child_process';
import { BC_LOG_FILE, BC_ERR_FILE, BC_STORAGE_PATH, WEB3_CONFIG, PLATFORM, BC_EXISTS_FILE, WEB3_URL } from "./../src/app/libs/config";
import { existsSync, appendFileSync, writeFileSync } from "fs";
import { join } from "path";
const rootPath = join(__dirname, '../');
const ASSETS = `${rootPath}/src/assets`;
const GETH = `${ASSETS}/geth/geth-${PLATFORM}`;
const GETH_CONFIG = `${ASSETS}/geth/config.json`;

export default class {
    constructor() {
        ipcMain.on("geth.initBC", (event, id, args) => {
            event.returnValue = new Promise(res => {
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
                initCLI.on("close", () => res());
            });
        });

        ipcMain.on("geth.startBC", (event, id, args) => {
            event.returnValue = new Promise(res => {
                console.log(existsSync(`assets`))
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
        });

        ipcMain.on("geth.runJS", (event, id, args) => {
            let jsCLI = spawn(GETH, [
                "attach",
                WEB3_URL])
            let done = false;
            jsCLI.stdout.on('data', (data) => {
                if (done) jsCLI.stdin.write("exit;\n");
                if (data.toString().indexOf(">") === -1) return;
                done = true;
                jsCLI.stdin.write(args[0]);
            });
        });
    }
}