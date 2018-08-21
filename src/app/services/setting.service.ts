import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { TranslateService } from '@ngx-translate/core';
import { CHECK_MAC_UPDATE_URL, CHECK_WIN_UPDATE_URL } from '../libs/config';
import { remote } from 'electron';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  private list = ["firstRun", "appType", "language", "wallet", "eden", "sharer", "txEden", "txSharer", "committee"];
  firstRun: boolean = true;
  appType: string = null;
  appTypeSet(value) {
    this.set("wallet", true);
    switch (value) {
      case "eden":
        this.set("eden", true);
        this.set("txEden", true);

        this.set("sharer", false);
        this.set("txSharer", false);
        this.set("committee", false);
        break;
      case "sharer":
        this.set("eden", false);
        this.set("txEden", false);

        this.set("sharer", true);
        this.set("txSharer", true);
        this.set("committee", true);
        break;
    }
    setTimeout(() => {
      this.router.navigate(["/wallet"]);
    }, 0);
    return value;
  }

  languageSet(value) {
    this.i18n.use(value);
    return value;
  }

  language: string = "zh";
  wallet: boolean = true;
  eden: boolean = true;
  sharer: boolean = true;
  txEden: boolean = true;
  txSharer: boolean = true;
  committee: boolean = true;

  appVersion = remote.app.getVersion();
  get(name: string) {
    if (this[`${name}Get`]) return this[`${name}Get`]();
    else return this[`${name}Get`];
  }
  set(name: string, value: any) {
    let newValue;
    if (this[`${name}Set`]) newValue = this[`${name}Set`](value);
    else newValue = value;
    this[name] = newValue;
    this.ipc.dbRun('setting', `UPDATE setting SET value='${JSON.stringify(newValue)}' WHERE name='${name}'`);
  }
  constructor(
    private ipc: IpcService,
    private i18n: TranslateService,
    private router: Router,
  ) {
    let promises = [];
    this.list.forEach(name => {
      promises.push(new Promise(async (res, rej) => {
        let db: any = await this.ipc.dbGet("setting", `SELECT * FROM setting WHERE name = '${name}'`);
        if (db) {
          this[name] = JSON.parse(db.value);
        } else {
          await this.ipc.dbRun('setting', `INSERT INTO setting (name, value) VALUES ('${name}', '${JSON.stringify(this[name])}')`);
        }
        res();
      }));
    });
    Promise.all(promises).then(() => {
      this.i18n.setDefaultLang(this.language);
      this.i18n.use(this['lang']).subscribe(() => {
      }, () => {
      }, () => {
        setTimeout(() => {
          this.ipc.ipcOnce("app.loaded.lang");
        }, 1000);
      });
    });
  }
  doNothing() { }

  async getUpdateVersion() {
    try {
      let res = await fetch(CHECK_MAC_UPDATE_URL, {
        method: 'GET',
      });
      if (!res.ok || res.status !== 200) return ''
      else return res.json();
    } catch (e) {
      return '';
    }
  }
}
