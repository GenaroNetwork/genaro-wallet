import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { clipboard } from "electron";
import { ElMessageService } from 'element-angular/release/element-angular.module';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../services/wallet.service';
import { DomSanitizer } from '@angular/platform-browser';

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

  newWalletType: string = "create";
  createStep: number = 4;
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
      this.alert["error"](this.translate.instant("WALLETNEW.REPEAT_PASSWORD_ERROR"));
      return;
    }

    if (this.password.length < 6) {
      this.alert["error"](this.translate.instant("WALLETNEW.PASSWORD_NOT_SAFE_LENGTH"));
      return;
    }

    this.loading = true;
    let walletName = this.wallet.generateName(this.translate.instant("WALLETNEW.WALLET_NAME_PREFIX"));
    this.wallet.createWallet(this.mnemonic, this.password, walletName).then(wallet => {
      if (this.newWalletType === "create") this.createStep++;
      if (this.newWalletType === "import") this.importStep++;

      this.walletName = wallet.name;
      this.walletAddress = wallet.address;

      if (this.newWalletType === "create") this.createStep++;
      if (this.newWalletType === "import") this.importStep++;

      this.loading = false;
    });
  }
  changeWalletName() {
    if (this.wallet.checkName(this.walletName)) {
      this.alert["error"](this.translate.instant("WALLETNEW.NEW_NAME_EXISTS"));
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
