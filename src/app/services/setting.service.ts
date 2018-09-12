import { Injectable, NgZone } from '@angular/core';
import { IpcService } from './ipc.service';
import { TranslateService } from '@ngx-translate/core';
import { UPDATE_STATES } from '../libs/config';
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
    this.ipc.ipcOnce("app.set.menu", value);
    return value;
  }

  language: string = "en";
  wallet: boolean = true;
  eden: boolean = true;
  sharer: boolean = true;
  txEden: boolean = true;
  txSharer: boolean = true;
  committee: boolean = true;

  appVersion = remote.app.getVersion();
  updateState: any = UPDATE_STATES.DEFAULT;
  updateApp(step: string = "check") {
    switch (step) {
      case "check":
        this.ipc.ipcOnce("app.update.check");
        break;
      case "download":
        this.ipc.ipcOnce("app.update.download");
        break;
      case "install":
        this.ipc.ipcOnce("app.update.install");
        break;
    }
  };

  set(name: string, value: any) {
    let newValue;
    if (this[`${name}Set`]) {
      newValue = this[`${name}Set`](value);
    } else {
      newValue = value;
    }
    this[name] = newValue;
    this.ipc.dbRun('setting', `UPDATE setting SET value='${JSON.stringify(newValue)}' WHERE name='${name}'`);
  }
  constructor(
    private ipc: IpcService,
    private i18n: TranslateService,
    private router: Router,
    private zone: NgZone,
  ) {
    if (navigator.language.toLowerCase().indexOf("zh") > -1) this.language = "zh";
    const promises = [];
    this.list.forEach(name => {
      promises.push(new Promise(async (res, rej) => {
        const db: any = await this.ipc.dbGet('setting', `SELECT * FROM setting WHERE name = '${name}'`);
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
      this.i18n.use(this.language);
      this.ipc.ipcOnce("app.set.menu", this.language);
    });

    let changeUpdateState = (state: UPDATE_STATES, redo: boolean = false) => {
      this.zone.run(() => {
        this.updateState = state;
      });
      if (!redo) return;
      setTimeout(() => {
        this.zone.run(() => {
          this.updateState = UPDATE_STATES.DEFAULT;
        });
      }, 5 * 1000);
    }
    this.ipc.ipcEvent.on("app.update.error", () => {
      changeUpdateState(UPDATE_STATES.ERROR, true);
    });
    this.ipc.ipcEvent.on("app.update.available", () => {
      changeUpdateState(UPDATE_STATES.DOWNLOADING);
    });
    this.ipc.ipcEvent.on("app.update.notavailable", () => {
      changeUpdateState(UPDATE_STATES.NOT_AVAILABLE, true);
    });
    this.ipc.ipcEvent.on("app.update.downloaded", () => {
      changeUpdateState(UPDATE_STATES.DOWNLOADED);
    });
    setInterval(this.updateApp("check"), 60 * 60 * 1000);
  }
  languageRendered() {
    this.ipc.ipcOnce("app.loaded.lang");
  }
}
