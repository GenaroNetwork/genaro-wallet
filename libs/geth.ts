import { spawn } from 'child_process';
import { existsSync, appendFileSync, writeFileSync } from "fs";
import { BC_LOG_FILE, BC_ERR_FILE, BC_STORAGE_PATH, WEB3_CONFIG, PLATFORM, BC_EXISTS_FILE, WEB3_URL } from "../libs/config";

export class GethLib {
    static async startGeth() {
        let initBC = () => {
            return new Promise(res => {
                let initCLI = spawn(`${__dirname}/geth/geth-${PLATFORM}`, [
                    "init",
                    `${__dirname}/geth/config.json`,
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
        }

        let startBC = () => {
            return new Promise(res => {
                let startCLI = spawn(`${__dirname}/geth/geth-${PLATFORM}`, [
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
        };

        if (!existsSync(BC_EXISTS_FILE)) {
            await initBC();
        }
        await startBC();
    }

    constructor() { }

}
