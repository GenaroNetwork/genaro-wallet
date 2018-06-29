import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { clipboard } from "electron";
import { ElMessageService } from 'element-angular/release/element-angular.module';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../services/wallet.service';
import { DomSanitizer } from '@angular/platform-browser';
let a = require("storj-lib")
console.log(a);

@Component({
  selector: 'app-walletNew',
  templateUrl: './walletNew.component.html',
  styleUrls: ['./walletNew.component.scss']
})
export class WalletNewComponent implements OnInit {
  @Output("close") closeEvent: EventEmitter<void> = new EventEmitter;

  constructor(
    private wallet: WalletService,
    private alert: ElMessageService,
    private translate: TranslateService,
    private sanitizer: DomSanitizer,
  ) {
    this.alert.setOptions({ showClose: true });
  }

  ALL_DONE() {
    this.closeEvent.emit();
  }

  newWalletType: string = null;
  createStep: number = 0;
  importStep: number = 0;
  title: string = "WALLETNEW.TITLE";

  copied: boolean = false;
  mnemonic: string = null;
  mnemonicRepeat: string = null;
  walletJson: string = null;
  password: string = null;
  passwordRepeat: string = null;
  oldPassword: string = null;
  walletName: string = null;
  walletAddress: string = null;
  importType: string = null;
  isEdit: boolean = null;
  walletNameNew: string = null;
  loading: boolean = false;


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
    this.importType = null;
    this.isEdit = false;
    this.walletNameNew = null;
    this.loading = false;
  }
  toCreate() {
    this.title = "WALLETNEW.TITLE_NEWWALLET";
    this.newWalletType = "create";

    this.createStep = 0;
    this.generateMnemonic();
  }
  toImport() {
    this.title = "WALLETNEW.TITLE_IMPORTWALLET";
    this.newWalletType = "import";

    this.importStep = 0;
  }

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

  async validatePassword() {

    if (this.password !== this.passwordRepeat) {
      this.alert["error"](this.translate.instant("WALLETNEW.REPEAT_PASSWORD_ERROR"));
      return;
    }

    if (this.password.length < 6) {
      this.alert["error"](this.translate.instant("WALLETNEW.PASSWORD_NOT_SAFE_LENGTH"));
      return;
    }

    if (this.newWalletType === "create") this.createStep++;
    if (this.newWalletType === "import") this.importStep++;

    this.loading = true;

    let walletName = this.wallet.generateName(this.translate.instant("WALLETNEW.WALLET_NAME_PREFIX"));
    let wallet = await this.wallet.createWallet(this.mnemonic, this.password, walletName);
    this.walletName = wallet.name;
    this.walletNameNew = this.walletName;
    this.walletAddress = wallet.address;

    if (this.newWalletType === "create") this.createStep++;
    if (this.newWalletType === "import") this.importStep++;
  }

  inputWalletName(event) {
    this.walletNameNew = event.target.value;
  }
  changeWalletName() {
    if (this.walletNameNew === this.walletName) return;
    if (this.wallet.checkName(this.walletNameNew)) {
      this.alert["error"](this.translate.instant("WALLETNEW.NEW_NAME_EXISTS"));
      this.walletNameNew = this.walletName;
      return;
    }
    this.wallet.changeName(this.walletAddress, this.walletName);
  }

  copy() {
    clipboard.writeText(this.mnemonic);
    this.copied = true;
    setTimeout(() => { this.copied = false }, 1000);
  }

  safeUrl(url: string) {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  ngOnInit() { }

}
