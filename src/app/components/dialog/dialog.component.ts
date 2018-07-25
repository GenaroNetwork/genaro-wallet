import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { nextTick } from 'q';
import { SPACE_UNIT_PRICE, TRAFFIC_UNIT_PRICE } from "../../libs/config";
import { TransactionService } from '../../services/transaction.service';
import { EdenService } from '../../services/eden.service';
import { TxEdenService } from '../../services/txEden.service';
import { SettingService } from '../../services/setting.service';
import { remote, shell } from "electron";
import { SETTINGS, GET_AGREEMENT, GET_TUTORIAL, INSTRUCTIONS_URL, DOWNLOAD_EDEN_URL, DOWNLOAD_SHARER_URL } from "../../libs/config";

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnChanges {
  version = remote.app.getVersion();
  SETTINGS = SETTINGS;
  constructor(
    private walletService: WalletService,
    private alert: NzMessageService,
    private txService: TransactionService,
    private i18n: TranslateService,
    private edenService: EdenService,
    private txEdenService: TxEdenService,
    public settingService: SettingService,
  ) { }
  @Input("name") dialogName: string = null;
  @Output("nameChange") dialogNameChange: EventEmitter<string> = new EventEmitter;

  //  Wallet change name
  walletChangeName: string = "";
  walletChangeNameInit() {
    let address = this.walletService.wallets.current;
    this.walletChangeName = this.walletService.wallets.all[address].name;
  }
  walletChangeNameDone() {
    let address = this.walletService.wallets.current;
    this.walletService.changeName(address, this.walletChangeName);
  }

  // wallet change password
  walletChangePassword: any = {
    old: "",
    new: "",
    repeat: "",
  }
  walletChangePasswordInit() {
    this.walletChangePassword = {
      old: "",
      new: "",
      repeat: "",
    }
  }
  walletChangePasswordDone() {
    return new Promise((res, rej) => {
      if (this.walletChangePassword.new.length < 6) {
        this.alert.error(this.i18n.instant("WALLETNEW.PASSWORD_NOT_SAFE_LENGTH"));
        rej("PASSWORD_ERROR_WEAK");
        return;
      }
      if (this.walletChangePassword.new !== this.walletChangePassword.repeat) {
        this.alert.error(this.i18n.instant("WALLETNEW.REPEAT_PASSWORD_ERROR"));
        rej("PASSWORD_ERROR_REPEAT");
        return;
      }
      let address = this.walletService.wallets.current;
      try {
        this.walletService.changePassword(address, this.walletChangePassword.old, this.walletChangePassword.new);
      } catch (e) {
        this.alert.error(this.i18n.instant("WALLETNEW.OLD_PASSWORD_ERROR"));
        rej("PASSWORD_ERROR_OLD");
        return;
      }
      res();
    });
  }

  // wallet export json
  walletExportJson: string = "";
  walletExportJsonInit() {
    this.walletExportJson = "";
  }
  walletExportJsonDone() {
    return new Promise((res, rej) => {
      let address = this.walletService.wallets.current;
      if (!this.walletService.validatePassword(address, this.walletExportJson)) {
        this.alert.error(this.i18n.instant("WALLETNEW.OLD_PASSWORD_ERROR"));
        rej("PASSWORD_ERROR_OLD");
        return;
      }
      this.walletService.exportJson(address);
      res();
    });
  }

  // walelt delete
  walletDelete: string = "";
  walletDeleteInit() {
    this.walletDelete = "";
  }
  walletDeleteDone() {
    return new Promise((res, rej) => {
      let address = this.walletService.wallets.current;
      if (!this.walletService.validatePassword(address, this.walletDelete)) {
        this.alert.error(this.i18n.instant("WALLETNEW.OLD_PASSWORD_ERROR"));
        rej("PASSWORD_ERROR_OLD");
        return;
      }
      nextTick(() => {
        this.walletService.deleteWallet(address);
      });
      res();
    });
  }

  // 购买空间
  buySpaceStep: number = 0;
  buySpaceLimit: number = 0;
  buySpaceLimitParams: number[] = [0, 30];
  buySpaceRange: number = 0;
  buySpaceRangeParams: number[] = [0, 1];
  buySpacePassword: string = "";
  buySpaceGas: number[] = [null, 2100000];
  SPACE_UNIT_PRICE = SPACE_UNIT_PRICE;
  buySpaceInit() {
    this.buySpaceStep = 0;
    this.buySpaceLimit = 0;
    this.buySpaceRange = 0;
    this.buySpacePassword = "";
    this.buySpaceRangeParams = [0, 1];
    this.buySpaceLimitParams = [0, 30];
  }
  async buySpaceSubmit() {
    let address = this.walletService.wallets.current;
    await this.txService.buyBucket(address, this.buySpacePassword, this.buySpaceRange, this.buySpaceLimit, this.buySpaceGas[1], this.buySpaceGas[0]);
    this.buySpaceStep++;
  }

  // 购买流量
  buyTrafficPassword: string = "";
  buyTrafficStep: number = 0;
  buyTraffic: number = 0;
  buyTrafficParams: number[] = [0, 1];
  buyTrafficGas: number[] = [null, 2100000];
  TRAFFIC_UNIT_PRICE = TRAFFIC_UNIT_PRICE;
  buyTrafficInit() {
    this.buyTrafficPassword = "";
    this.buyTrafficStep = 0;
    this.buyTraffic = 0;
    this.buyTrafficParams = [0, 1];
  }
  async buyTrafficSubmit() {
    let address = this.walletService.wallets.current;
    await this.txService.buyTraffic(address, this.buyTrafficPassword, this.buyTraffic, this.buyTrafficGas[1], this.buyTrafficGas[0]);
    this.buyTrafficStep++;
  }


  //eden 需要密码
  edenNeedPass: string = "";
  edenNeedPassDone() {
    return new Promise((res, rej) => {
      if (this.edenService.generateEnv(this.edenNeedPass)) res();
      else (rej());
    })
  }


  //txeden 需要密码
  txEdenNeedPass: string = "";
  txEdenNeedPassDone() {
    this.txEdenService.beforehandSign(this.txEdenNeedPass);
  }

  // setting
  settingGetLanguageName(lang) {
    try {
      let name = require(`../../../assets/i18n/${lang}.json`).LANGUAGE_NAME;
      if (name) return name;
      else return lang;
    } catch (e) {
      return lang;
    }
  }

  // common
  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    if (changes.dialogName) {
      if (this[`${this.dialogName}Init`])
        this[`${this.dialogName}Init`]();
    }
  }
  dialogDone() {
    if (this[`${this.dialogName}Done`]) {
      let result = this[`${this.dialogName}Done`]();
      if (result instanceof Promise) {
        result.then(() => {
          this.dialogNameChange.emit(null);
        }).catch(e => {
          console.log(e);
        });
      } else {
        this.dialogNameChange.emit(null);
      }
    }
  }

  // help
  openInstructionsWeb() {
    shell.openExternal(INSTRUCTIONS_URL);
  }
  openDownloadEdenWeb() {
    shell.openExternal(DOWNLOAD_EDEN_URL);
  }
  openDownloadSharerWeb() {
    shell.openExternal(DOWNLOAD_SHARER_URL);
  }

  // about
  isLastestVersion: boolean = true;
  updateUrl: string = '';
  aboutInit() {
    this.checkUpdate();
  }
  openAgreementWeb() {
    shell.openExternal(GET_AGREEMENT(this.i18n.currentLang));
  }
  openPrivacyWeb() {
    shell.openExternal(GET_TUTORIAL(this.i18n.currentLang));
  }
  openLogsWeb() {
    //shell.openExternal();
  }
  async checkUpdate() {
    this.isLastestVersion = true;
    let latestVersion = await this.settingService.getUpdateVersion();
    if (!latestVersion && latestVersion.version && latestVersion.url) {
      let lv = latestVersion.split(".");
      let cv = this.version.split(".");
      for (let index = 0, length = lv.length; index < length; index++) {
        let lvn = parseInt(lv[index]);
        let cvn = parseInt(cv[index]);
        if (lvn > cvn) {
          this.isLastestVersion = false;
          this.updateUrl = latestVersion.url;
          break;
        }
      }
    }
  }
  openUpdateVersion() {
    shell.openExternal(GET_TUTORIAL(this.updateUrl));
  }

}
