import { Injectable } from '@angular/core';
import { spawn } from 'child_process';
import { ipcRenderer } from "electron";
import { BC_EXISTS_FILE } from "./../libs/config";
import { existsSync } from "fs";

let ipcId = 0;
function _initBC() {
    return new Promise((res, rej) => {
        ipcRenderer.send("geth.initBC", ipcId++, (event, data) => {
            res(data);
        });
    });
}

function _startBC() {
    return new Promise((res, rej) => {
        ipcRenderer.send("geth.startBC", ipcId++, (event, data) => {
            res(data);
        });
    });
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
        let initBC = async () => {
            return await _initBC();
        };

        let startBC = async () => {
            return await _startBC();
        };

        if (!existsSync(BC_EXISTS_FILE)) {
            await initBC();
        }
        await startBC();
    }
    constructor() { }

}
