import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';


@Injectable({
  providedIn: 'root'
})
export class NickService {

  constructor(
    private ipc: IpcService
  ) { }

  update(address, nick) {
    this.ipc.dbRun('nick', `INSERT INTO nick (address, nick) VALUES ('${address}', '${nick}')`);
  }

  async getNick(address) {
    let data = await this.ipc.dbAll('nick', `SELECT * FROM nick WHERE address='${address}'`);
    if(data && data.length > 0) {
      return data[0].nick;
    }
    return '';
  }

  async getAddress(nick) {
    let data = await this.ipc.dbAll('nick', `SELECT * FROM nick WHERE nick='${nick}'`);
    if(data && data.length > 0) {
      return data[0].address;
    }
    return '';
  }

  delete(address) {
    this.ipc.dbRun('nick', `DELETE FROM nick WHERE address='${address}'`);
  }
}

