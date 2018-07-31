import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { BC_EXISTS_FILE, FULL_NODE_URL } from '../libs/config';
import { existsSync } from 'fs';

let ipcId = 0;
@Injectable({
    providedIn: 'root'
})
export class GethService {
    private static runJS(JSCODE) {
        ipcRenderer.send('geth.runJS', ipcId++, JSCODE);
    }

    static async startMine() {
        GethService.runJS('miner.start();\n');
    }

    static async stopMine() {
        GethService.runJS('miner.stop();\n');
    }

    static async addFullNode() {
        GethService.runJS(`admin.addPeer("${FULL_NODE_URL}");`);
    }

    static startGeth() {
        return new Promise(res => {
            ipcRenderer.on(`geth.startBC.${ipcId}`, res);
            ipcRenderer.send('geth.startBC', ipcId++);
        });
    }
    constructor() { }

}
