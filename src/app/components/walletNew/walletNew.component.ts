import { Component, OnInit, ApplicationRef } from '@angular/core';
import { SqliteService } from '../../services/sqlite.service';
import { clipboard } from "electron";
import { ElMessageService } from 'element-angular/release/element-angular.module';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-walletNew',
  templateUrl: './walletNew.component.html',
  styleUrls: ['./walletNew.component.scss']
})
export class WalletNewComponent implements OnInit {

  constructor(
    private sqlite: SqliteService,
    private wallet: WalletService,
    private alert: ElMessageService,
    private translate: TranslateService,
  ) { }
  newWalletType: string = null;
  title: string = "WALLETNEW.TITLE";
  toFrontPage() {
    this.title = "WALLETNEW.TITLE";
    this.newWalletType = null;

    this.mnemonic = null;
    this.mnemonicRepeat = null;
    this.password = null;
    this.passwordRepeat = null;
    this.oldPassword = null;
    this.walletName = null;
    this.walletAddress = null;
    this.walletJson = null;
  }
  createStep: number = 0;
  toCreate() {
    this.title = "WALLETNEW.TITLE_NEWWALLET";
    this.newWalletType = "create";

    this.createStep = 4;
    this.generateMnemonic();
  }
  importStep: number = 0;
  toImport() {
    this.title = "WALLETNEW.TITLE_IMPORTWALLET";
    this.newWalletType = "import";

    this.importStep = 0;
  }

  copied: boolean = false;
  mnemonic: string = null;
  mnemonicRepeat: string = null;
  walletJson: string = null;
  password: string = null;
  passwordRepeat: string = null;
  oldPassword: string = null;
  walletName: string = null;
  walletAddress: string = null;

  generateMnemonic() {
    this.mnemonic = this.wallet.generateMnemonic();
  }

  mnemonicChange(event) {
    this.mnemonic = event.target.value;
  }
  mnemonicRepeatChange(event) {
    this.mnemonicRepeat = event.target.value;
  }
  passwordChange(event) {
    this.password = event.target.value;
  }
  passwordRepeatChange(event) {
    this.passwordRepeat = event.target.value;
  }
  oldPasswordChange(event) {
    this.oldPassword = event.target.value;
  }

  validateMnemonic() {
    if (this.mnemonic === this.mnemonicRepeat) {
      this.createStep++;
      return;
    }
    this.alert.setOptions({ showClose: true });
    this.alert["error"](this.translate.instant("WALLETNEW.REPEAT_MNEMONIC_ERROR"));
  }

  validatePassword() {
    if (this.password !== this.passwordRepeat) {
      this.alert.setOptions({ showClose: true });
      this.alert["error"](this.translate.instant("WALLETNEW.REPEAT_PASSWORD_ERROR"));
      return;
    }

    if (this.newWalletType === "create") this.createStep++;
    if (this.newWalletType === "import") this.importStep++;

    let wallet = this.wallet.createWallet(this.mnemonic, this.password);
    this.walletName = wallet.name;
    this.walletAddress = wallet.address;

    if (this.newWalletType === "create") this.createStep++;
    if (this.newWalletType === "import") this.importStep++;

  }

  copy() {
    clipboard.writeText(this.mnemonic);
    this.copied = true;
    setTimeout(() => { this.copied = false }, 1000);
  }


  ngOnInit() {
  }

}
