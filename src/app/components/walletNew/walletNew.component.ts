import { Component, Output, EventEmitter, Input } from '@angular/core';
import { clipboard, remote } from 'electron';
import { TranslateService } from '@ngx-translate/core';
import { WalletService } from '../../services/wallet.service';
import { NzMessageService } from 'ng-zorro-antd';
import { readFileSync } from 'fs';
import { basename } from 'path';
import { TxEdenService } from '../../services/txEden.service';

@Component({
  selector: 'app-walletNew',
  templateUrl: './walletNew.component.html',
  styleUrls: ['./walletNew.component.scss']
})
export class WalletNewComponent {

  @Input('walletCount') walletCount: number;
  @Output('stateChange') stateChangeEvent: EventEmitter<boolean> = new EventEmitter;

  constructor(
    public wallet: WalletService,
    private alert: NzMessageService,
    private translate: TranslateService,
    private txEden: TxEdenService,
  ) {
  }

  ALL_DONE() {
    this.stateChangeEvent.emit(false);
    if (this.isEdit) {
      this.changeWalletName();
    }
  }

  newWalletType: string = null;
  createStep = 0;
  importStep = 0;
  title = 'WALLETNEW.TITLE';

  copied = false;
  mnemonic: string = null;
  mnemonicRepeat: string = null;
  walletJson: string = null;
  walletJsonName: string = null;
  password: string = null;
  passwordRepeat: string = null;
  oldPassword: string = null;
  walletName: string = null;
  walletAddress: string = null;
  importType: string = null;
  isEdit: boolean = null;
  loading = false;


  toFrontPage() {
    this.title = 'WALLETNEW.TITLE';
    this.newWalletType = null;

    this.mnemonic = null;
    this.mnemonicRepeat = null;
    this.password = null;
    this.passwordRepeat = null;
    this.oldPassword = null;
    this.walletName = null;
    this.walletAddress = null;
    this.walletJson = null;
    this.walletName = null;
    this.importType = null;
    this.isEdit = false;
  }
  toCreate() {
    this.title = 'WALLETNEW.TITLE_NEWWALLET';
    this.newWalletType = 'create';

    this.createStep = 0;
    this.generateMnemonic();
  }
  toImport() {
    this.title = 'WALLETNEW.TITLE_IMPORTWALLET';
    this.newWalletType = 'import';

    this.importStep = 0;
  }

  generateMnemonic() {
    this.mnemonic = this.wallet.generateMnemonic();
  }

  downloadMnemonic() {
    remote.dialog.showSaveDialog({});
  }

  validateMnemonic() {
    if (this.mnemonic === this.mnemonicRepeat) {
      this.createStep++;
      return;
    }
    this.alert.create('error', this.translate.instant('WALLETNEW.REPEAT_MNEMONIC_ERROR'));
  }

  validateOldMnemonic() {
    if (!this.wallet.validateMnemonic(this.mnemonic)) {
      this.alert.create('error', this.translate.instant('WALLETNEW.OLD_MNEMONIC_ERROR'));
      return;
    }
    this.importStep++;
  }

  async validatePassword() {
    if (this.password !== this.passwordRepeat) {
      this.alert.create('error', this.translate.instant('WALLETNEW.REPEAT_PASSWORD_ERROR'));
      return;
    }

    if (this.password.length < 6) {
      this.alert.create('error', this.translate.instant('WALLETNEW.PASSWORD_NOT_SAFE_LENGTH'));
      return;
    }
    const walletName = this.wallet.generateName(this.translate.instant('WALLETNEW.WALLET_NAME_PREFIX'));
    const wallet = await this.wallet.createWallet(this.mnemonic, this.password, walletName);
    this.txEden.beforehandSign(this.password, wallet.address);
    if (this.newWalletType === 'create') { this.createStep++; }
    if (this.newWalletType === 'import') { this.importStep++; }
    this.walletName = wallet.name;
    this.walletAddress = wallet.address;
    if (this.newWalletType === 'create') { this.createStep++; }
    if (this.newWalletType === 'import') { this.importStep++; }
  }

  validateOldPassword() {
    const json = readFileSync(this.walletJson, { encoding: 'utf-8' });
    let wallet;
    try {
      wallet = this.wallet.importWallet(json, this.oldPassword, this.wallet.generateName());
      this.txEden.beforehandSign(this.oldPassword, wallet.address);
    } catch (e) {
      switch (e.message) {
        case 'Not a V3 wallet':
          this.alert.create('error', this.translate.instant('WALLETNEW.IMPORT_JSON_ERROR_ILLEGAL'));
          break;
        case 'Assertion failed':
          this.alert.create('error', this.translate.instant('WALLETNEW.IMPORT_JSON_ERROR_PASSWORD'));
          break;
        default:
          this.alert.create('error', this.translate.instant('WALLETNEW.IMPORT_JSON'));
          break;
      }
      return;
    }

    if (this.newWalletType === 'create') { this.createStep++; }
    if (this.newWalletType === 'import') { this.importStep++; }

    this.walletName = wallet.name;
    this.walletAddress = wallet.address;

    if (this.newWalletType === 'create') { this.createStep++; }
    if (this.newWalletType === 'import') { this.importStep++; }
  }

  changeWalletName() {
    if (this.wallet.checkName(this.walletName)) {
      this.alert.create('error', this.translate.instant('WALLETNEW.NEW_NAME_EXISTS'));
      return;
    }
    this.wallet.changeName(this.walletAddress, this.walletName);
  }

  selectJson() {
    const files = remote.dialog.showOpenDialog({ properties: ['openFile'] });
    this.walletJson = files[0];
    this.walletJsonName = basename(this.walletJson);
  }

  copy() {
    clipboard.writeText(this.mnemonic);
    this.copied = true;
    setTimeout(() => { this.copied = false; }, 1000);
  }

}
