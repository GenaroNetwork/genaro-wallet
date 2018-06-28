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
    this.walletJson = null;
  }
  createStep: number = 0;
  toCreate() {
    this.title = "WALLETNEW.TITLE_NEWWALLET";
    this.newWalletType = "create";

    this.createStep = 0;
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

  generateMnemonic() {
    this.mnemonic = this.wallet.generateMnemonic();
  }

  mnemonicRepeatChange(event) {
    this.mnemonicRepeat = event.target.value;
  }

  validateMnemonic() {

    if (this.mnemonic === this.mnemonicRepeat) {
      this.createStep++;
      return;
    }
    this.alert.setOptions({ showClose: true });
    this.alert["error"](this.translate.instant("WALLETNEW.REPEAT_MNEMONIC_ERROR"));

  }

  copy() {
    clipboard.writeText(this.mnemonic);
    this.copied = true;
    setTimeout(() => { this.copied = false }, 1000);
  }


  ngOnInit() {
  }

}
