import { Injectable } from '@angular/core';
import { WEB3_URL } from "../../../libs/config";
import Web3 from 'genaro-web3';
import { ElectronService } from "ngx-electron";

let web3: Web3;

@Injectable({
  providedIn: 'root'
})
export class Web3Service {

  eth: any;
  event: any;
  init() {
    this.eth = web3.eth;
    this.event.emit("started");
  }

  constructor(private electron: ElectronService) {

    this.event = (() => {
      let events = {};
      return {
        on(event, callback) {
          events[event] = events[event] || [];
          events[event].push(callback);
        },
        emit(event, ...args) {
          if (!events[event]) return;
          events[event].forEach(callback => {
            callback(...args);
          });
        },
      };
    })();
    if (web3) {
      this.init();
    } else {
      this.electron.ipcRenderer.send("web3-start");
      this.electron.ipcRenderer.on("web3-started", () => {
        web3 = new Web3(WEB3_URL);
        this.init();
      });
    }
  }
}
