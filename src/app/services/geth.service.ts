import { Injectable } from '@angular/core';
import { ipcRenderer } from "electron";
import { BC_EXISTS_FILE } from "./../libs/config";
import { existsSync } from "fs";

let ipcId = 0;
function _initBC() {
    return new Promise((res, rej) => {
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

    static startGeth() {
        return new Promise(res => {
            ipcRenderer.once(`geth.startBC.${ipcId}`, () => res);
            ipcRenderer.send("geth.startBC", ipcId++);
        });
    }
    constructor() { }

}
