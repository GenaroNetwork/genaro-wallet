import { Injectable } from '@angular/core';
import { ipcRenderer } from "electron";
import { Observable } from '../../../node_modules/rxjs';

@Injectable({
  providedIn: 'root'
})
export class IpcService {
  private ipcId: number = 0;

  // 直接接触 ipc ，不应该暴露出去
  // 单次 ipc 使用 promise，有持续返回的 ipc 使用 Observable
  public ipcSync(name: string, ...datas) { // [fixable] 此处应改为 private，并且不应该出现同步ipc方法
    return ipcRenderer.sendSync(name, ...datas);
  }
  private ipcOnce(name: string, ...datas) {
    return new Promise((res, rej) => {
      ipcRenderer.once(`${name}.${this.ipcId}`, (sender, ...datas) => {
        res(...datas);
      });
      ipcRenderer.send(name, this.ipcId++, ...datas);
    });
  }
  private ipcMulti(name: string, ...datas) {
    return new Observable(ob => {
      ipcRenderer.on(`${name}.${this.ipcId}`, (sender, ...datas) => {
        ob.next(...datas);
      })
      ipcRenderer.on(`${name}.${this.ipcId}.done`, (sender, ...datas) => {
        ob.complete();
      })
      ipcRenderer.send(name, this.ipcId++, ...datas);
    });
  }

  // 数据库相关(底层)
  private db(type: string, sql: string) {
    return this.ipcOnce(`db.${type}`, sql);
  }
  dbRun(table: string, sql) {
    return this.db(`${table}.run`, sql);
  }
  dbGet(table: string, sql) {
    return this.db(`${table}.get`, sql);
  }
  dbAll(table: string, sql): Promise<any[]> {
    // @ts-ignore
    return this.db(`${table}.all`, sql);
  }

  // geth相关
  ethInit() {

  }

  // 设置相关

  constructor() { }

}
