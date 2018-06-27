import { Injectable } from '@angular/core';
import { WEB3_URL, LITE_WALLET } from "./../libs/config";
import { GethService } from "./geth.service";
import Web3 from 'genaro-web3';
let web3: any = new Web3(WEB3_URL);

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  constructor() {
    this.event = (() => {
      let events: any = {};
      return {
        on(event, callback) {
          if (!events[event]) events[event] = [];
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
    web3.eth.net.isListening()
      .then(() => {
        this.init();
      })
      .catch(e => {
        // web3 is not connected
        if (LITE_WALLET) {
          // is lite wallet
          throw new Error("Can not connect to mordred.");
        }
        GethService.startGeth().then(() => {
          web3 = new Web3(WEB3_URL);
          this.init();
        });

      });
  }

  eth: any;
  event: any;
  init() {
    this.eth = web3.eth;
    this.event.emit("started");
    GethService.startMine();
  };
}
