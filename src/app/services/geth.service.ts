import { Injectable } from '@angular/core';
import { spawn } from 'child_process';
import { ipcRenderer } from "electron";
import { BC_EXISTS_FILE } from "./../libs/config";
import { existsSync } from "fs";

let ipcId = 0;
function _initBC() {
    return ipcRenderer.sendSync("geth.initBC", ipcId++);
}

function _startBC() {
    return ipcRenderer.sendSync("geth.startBC", ipcId++);
}

function _runJS(JSCODE) {
    ipcRenderer.send("geth.runJS", ipcId++, [JSCODE]);
}

@Injectable({
    providedIn: 'root'
})
export class GethService {
    private static runJS(JSCODE) {
        _runJS(JSCODE);
    };

    static async startMine() {
        GethService.runJS("miner.start();\n");
    }

    static async stopMine() {
        GethService.runJS("miner.stop();\n");
    }

    static async startGeth() {
        let initBC = () => {
            return _initBC();
        }

        let startBC = () => {
            return _startBC();
        };

        if (!existsSync(BC_EXISTS_FILE)) {
            await initBC();
        }
        await startBC();
    }
    constructor() { }

}
