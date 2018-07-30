import { Injectable } from '@angular/core';
import { IpcService } from './ipc.service';
import { TranslateService } from '../../../node_modules/@ngx-translate/core';
import { SETTINGS, CHECK_MAC_UPDATE_URL, CHECK_WIN_UPDATE_URL } from "../libs/config";
import { remote } from "electron";
const axios = require('axios');

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private _showWallet: boolean = true;
  get showWallet() {
    return this._showWallet;
  }
  set showWallet(value) {
    this._showWallet = value;
    if (value !== null)
      this.update("showWallet");
  }

  private _showEden: boolean = true;
  get showEden() {
    return this._showEden;
  }
  set showEden(value) {
    this._showEden = value;
    if (value !== null)
      this.update("showEden");
  }

  private _showTxEden: boolean = true;
  get showTxEden() {
    return this._showTxEden;
  }
  set showTxEden(value) {
    this._showTxEden = value;
    if (value !== null)
      this.update("showTxEden");
  }

  private _showSharer: boolean = true;
  get showSharer() {
    return this._showSharer;
  }
  set showSharer(value) {
    this._showSharer = value;
    if (value !== null)
      this.update("showSharer");
  }

  private _showTxSharer: boolean = true;
  get showTxSharer() {
    return this._showTxSharer;
  }
  set showTxSharer(value) {
    this._showTxSharer = value;
    if (value !== null)
      this.update("showTxSharer");
  }

  private _edenListMode: boolean = false;
  get edenListMode() {
    return this._edenListMode;
  }
  set edenListMode(value) {
    this._edenListMode = value;
    if (value !== null)
      this.update("edenListMode");
  }

  private _lang: string = "en";
  get lang() {
    return this._lang;
  }
  set lang(value) {
    this._lang = value;
    this.i18n.use(value);
    this.update("lang");
  }

  private _showCommittee: boolean = true;
  get showCommittee() {
    return this._showCommittee;
  }
  set showCommittee(value) {
    this._showCommittee = value;
    if (value !== null)
      this.update("showCommittee");
  }

  appName = remote.app.getName();
  appVersion = remote.app.getVersion();
  constructor(
    private ipc: IpcService,
    private i18n: TranslateService,
  ) {
    let names = ["showWallet", "showEden", "showTxEden", "showSharer", "showTxSharer", "lang"];
    names.forEach(async name => {
      let value: any = await this.ipc.dbGet("setting", `SELECT value FROM setting WHERE name = '${this.appName}-${name}'`);
      if (SETTINGS.indexOf(name) > -1) this[name] = null;
      else if (value) this[name] = JSON.parse(value.value);
      else
        await this.ipc.dbRun("setting", `INSERT INTO setting (name, value) VALUES ('${this.appName}-${name}', '${JSON.stringify(this[name])}')`);
    });
  }
  update(name) {
    this.ipc.dbRun("setting", `UPDATE setting SET value='${JSON.stringify(this[name])}' WHERE name='${this.appName}-${name}'`);
  }

  async getUpdateVersion() {
    try {
      let res = await axios.get(CHECK_MAC_UPDATE_URL);
      if (res.status !== 200) {
        return '';
      }
      return res.data;
    }
    catch (e) {
      console.log(e);
      return '';
    }
  }
}
