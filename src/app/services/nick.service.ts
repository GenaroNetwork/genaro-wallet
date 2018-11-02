import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';


@Injectable({
  providedIn: 'root'
})
export class NickService {

  constructor(
    private ipc: IpcService
  ) { }

  private addressNick = {};
  private nickAddress = {};

  update(address, nick) {
    this.ipc.dbRun('nick', `INSERT INTO nick (address, nick) VALUES ('${address}', '${nick}')`);
    this.addressNick[address] = nick;
    this.nickAddress[nick] = address;
  }

  async getNick(address) {
    let data = await this.ipc.dbAll('nick', `SELECT * FROM nick WHERE address='${address}'`);
    if(data && data.length > 0) {
      let nick = data[0].nick;
      this.addressNick[address] = nick;
      this.nickAddress[nick] = address;
      return nick;
    }
    return '';
  }

  async getAddress(nick) {
    let data = await this.ipc.dbAll('nick', `SELECT * FROM nick WHERE nick='${nick}'`);
    if(data && data.length > 0) {
      let address = data[0].address;
      this.addressNick[address] = nick;
      this.nickAddress[nick] = address;
      return address;
    }
    return '';
  }

  delete(address) {
    this.ipc.dbRun('nick', `DELETE FROM nick WHERE address='${address}'`);
    let nick = this.addressNick[address];
    delete this.addressNick[address];
    if(nick) {
      delete this.nickAddress[nick];
    }
  }
}

