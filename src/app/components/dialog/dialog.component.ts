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

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnChanges {
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
      if (!this.walletService.validatePassword(address, this.walletExportJson)) {
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
  buySpaceRange: number = 0;
  buySpacePassword: string = "";
  buySpaceGas: number[] = [null, 2100000];
  SPACE_UNIT_PRICE = SPACE_UNIT_PRICE;
  async buySpaceSubmit() {
    let address = this.walletService.wallets.current;
    debugger;
    await this.txService.buyBucket(address, this.buySpacePassword, this.buySpaceRange, this.buySpaceLimit, this.buySpaceGas[1], this.buySpaceGas[0]);
    this.buySpaceStep++;
  }

  // 购买流量
  buyTrafficPassword: string = "";
  buyTrafficStep: number = 0;
  buyTraffic: number = 0;
  TRAFFIC_UNIT_PRICE = TRAFFIC_UNIT_PRICE;
  buyTrafficGas: number[] = [null, 2100000];
  async buyTrafficSubmit() {
    debugger
    let address = this.walletService.wallets.current;
    await this.txService.buyTraffic(address, this.buyTrafficPassword, this.buyTraffic, this.buyTrafficGas[1], this.buyTrafficGas[0]);
    this.buySpaceStep++;
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


  //eden 需要密码
  edenNeedPass: string = "";
  edenNeedPassDone() {
    this.edenService.generateEnv(this.edenNeedPass);
  }


  //txeden 需要密码
  txEdenNeedPass: string = "";
  txEdenNeedPassDone() {
    this.txEdenService.beforehandSign(this.txEdenNeedPass);
  }

}
