import { Component, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { nextTick } from 'q';
import { SPACE_UNIT_PRICE, TRAFFIC_UNIT_PRICE } from "../../libs/config";
import { TransactionService } from '../../services/transaction.service';

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
  ) { }
  @Input("name") dialogName: string = null;
  @Output("nameChange") dialogNameChange: EventEmitter<string> = new EventEmitter;

  //  Wallet change name
  walletChangeName: string = "";
  walletChangeNameInit() {
    this.walletService.currentWallet.subscribe(wallet => {
      this.walletChangeName = wallet.name;
    }).unsubscribe();
  }
  walletChangeNameDone() {
    this.walletService.currentWallet.subscribe(wallet => {
      this.walletService.changeName(wallet.address, this.walletChangeName);
    }).unsubscribe();
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
      this.walletService.currentWallet.subscribe(wallet => {
        try {
          this.walletService.changePassword(wallet.address, this.walletChangePassword.old, this.walletChangePassword.new);
        } catch (e) {
          this.alert.error(this.i18n.instant("WALLETNEW.OLD_PASSWORD_ERROR"));
          rej("PASSWORD_ERROR_OLD");
          return;
        }
        res();
      }).unsubscribe();
    });
  }

  // wallet export json
  walletExportJson: string = "";
  walletExportJsonInit() {
    this.walletExportJson = "";
  }
  walletExportJsonDone() {
    return new Promise((res, rej) => {
      this.walletService.currentWallet.subscribe(wallet => {
        if (!this.walletService.validatePassword(wallet.address, this.walletExportJson)) {
          this.alert.error(this.i18n.instant("WALLETNEW.OLD_PASSWORD_ERROR"));
          rej("PASSWORD_ERROR_OLD");
          return;
        }
        this.walletService.exportJson(wallet.address);
        res();
      }).unsubscribe();
    });
  }

  // walelt delete
  walletDelete: string = "";
  walletDeleteInit() {
    this.walletDelete = "";
  }
  walletDeleteDone() {
    return new Promise((res, rej) => {
      this.walletService.currentWallet.subscribe(wallet => {
        if (!this.walletService.validatePassword(wallet.address, this.walletExportJson)) {
          this.alert.error(this.i18n.instant("WALLETNEW.OLD_PASSWORD_ERROR"));
          rej("PASSWORD_ERROR_OLD");
          return;
        }
        nextTick(() => {
          this.walletService.deleteWallet(wallet.address);
        });
        res();
      }).unsubscribe();
    });
  }

  // 购买空间
  buySpaceStep: number = 0;
  buySpaceLimit: number = 0;
  buySpaceRange: number = 0;
  buySpacePassword: string = "";
  buySpaceGas: any;
  SPACE_UNIT_PRICE = SPACE_UNIT_PRICE;
  buySpaceInit() {
    this.buySpaceStep = 0;
    this.buySpaceRange = 0;
    this.buySpaceLimit = 0;
    this.buySpacePassword = "";
  }
  buySpaceDone() {
    this.walletService.currentWallet.subscribe(wallet => {
      this.txService.buyBucket(wallet.address, this.buySpacePassword, this.buySpaceRange, this.buySpaceLimit, this.buySpaceGas[1], this.buySpaceGas[0]);
      this.buySpaceStep++;
    }).unsubscribe();
  }

  // 购买流量
  buyTrafficStep: number = 0;
  buyTraffic: number = 0;
  TRAFFIC_UNIT_PRICE = TRAFFIC_UNIT_PRICE;

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

}
