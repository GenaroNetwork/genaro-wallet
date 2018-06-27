import { Injectable } from '@angular/core';
import { ipcRenderer } from "electron";
let ipcId = 0;

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  /**
   * @param {string} address 钱包地址,
   */
  getWallet(address) {
    return new Promise((res, rej) => {
      ipcRenderer.on(`db.wallet.get.${ipcId}`, (event, data) => { res(data) });
      ipcRenderer.send("db.wallet.get", ipcId++, `SELECT * FROM wallet WHERE address = '${address}'`);
    });
  }

  /**
   * @param {string} name 钱包名（自定义）
   * @param {Object} wallet 钱包详细信息 (Object)
   */
  saveWallet(name, wallet) {
    return new Promise((res, rej) => {
      ipcRenderer.on(`db.wallet.run.${ipcId}`, (event) => res);
      ipcRenderer.send("db.wallet.run", ipcId++, `INSERT INTO wallet 
      (name, address, wallet) VALUES 
      ('${name}','${wallet.address}','${JSON.stringify(wallet)}')`);
    });
  }

  constructor() { }

}
