import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  /**
   * @param {string} address 钱包地址,
   */
  getWallet(address) {
    return this.ipc.dbGet("wallet", `SELECT * FROM wallet WHERE address = '${address}'`);
  }

  /**
   * @param {string} name 钱包名（自定义）
   * @param {Object} wallet 钱包详细信息 (Object)
   */
  saveWallet(name, wallet) {
    return this.ipc.dbRun("wallet", `INSERT INTO wallet 
    (name, address, wallet) VALUES 
    ('${name}','${wallet.address}','${JSON.stringify(wallet)}')`);
  }

  constructor(
    private ipc: IpcService,
  ) { }

}
