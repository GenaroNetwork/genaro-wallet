import { Injectable } from '@angular/core';
import { newWalletManager, generateMnemonic, validateMnemonic } from "jswallet-manager";
import { WALLET_CONFIG_PATH } from "../libs/config";
import { BehaviorSubject } from 'rxjs';
import { remote } from "electron";
import { TranslateService } from '@ngx-translate/core';
import { writeFileSync } from 'fs';
import { TransactionService } from './transaction.service';


@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private walletManager: any;
  public walletList: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public currentWallet: BehaviorSubject<any> = new BehaviorSubject<any>(void 0);
  wallets: any = {
    current: null,
    all: {},
  };
  balances: any = {}

  constructor(
    private i18n: TranslateService,
    private txService: TransactionService,
  ) {
    this.walletManager = newWalletManager(WALLET_CONFIG_PATH);
    this.walletList.next(this.walletManager.listWallet());
    this.walletList.subscribe(walletList => {
      if (walletList.length === 0) {
        this.currentWallet.next(null);
        return;
      }
      walletList.forEach(wallet => {
        this.wallets.all[wallet.address] = wallet;
      });
      let currentAddress = this.wallets.current;
      if (currentAddress && walletList.find(wallet => wallet.address === currentAddress)) return;
      this.currentWallet.next(walletList[0]);
    });
    this.currentWallet.subscribe(wallet => {
      if (wallet) this.wallets.current = wallet.address;
      else this.wallets.current = null;
    });
    this.txService.newBlockHeaders.subscribe(async bh => {
      if (!bh) return;
      let address = this.wallets.current;
      if (!address) return;
      let balance = await this.txService.getBalance(address);
      this.balances[address] = balance;
    });
  }

  createWallet(mnemonic: string, password: string, name: string): Promise<any> {
    return new Promise(res => {
      setTimeout(() => {
        let wallet = this.walletManager.importFromMnemonic(mnemonic, password, name);
        this.walletList.next(this.walletManager.listWallet());
        res(wallet);
      }, 0);
    });
  }

  importWallet(json: any, password, name) {
    let wallet = this.walletManager.importFromJson(json, password, name);
    this.walletList.next(this.walletManager.listWallet());
    return wallet;
  }

  /**
   * @param {string} name 
   * @returns {boolean} true 代表该名字存在
   */
  checkName(name: string) {
    return this.walletManager.listWallet().find(wallet => wallet.name === name) !== void 0;
  }

  changeName(address: string, newName: string) {
    this.walletManager.renameWallet(address, newName);
    this.walletList.next(this.walletManager.listWallet());
  }

  changePassword(address: string, oldPassword: string, newPassword: string) {
    this.walletManager.changePassword(address, oldPassword, newPassword);
    this.walletList.next(this.walletManager.listWallet());
  }

  getPrivateKey(addr: string, pass: string) {
    return this.walletManager.exportPrivateKey(addr, pass);
  }

  /**
   * 
   * @param {string} prefix 前缀，根据 i18n 决定
   */
  generateName(prefix: string = "Wallet") {
    let i = 0;
    let wallets = this.walletManager.listWallet();
    while (wallets.find(wallet => wallet.name === `${prefix} ${++i}`) !== void 0) { }
    return `${prefix} ${i}`;
  }

  validatePassword(address: string, password: string) {
    return this.walletManager.validatePassword(address, password);
  }

  exportJson(address: string) {
    let path = remote.dialog.showSaveDialog({
      title: this.i18n.instant("COMMON.SELECT_SAVE_PATH"),
      // @ts-ignore 该行用于忽略 typescript 报错，勿删
      properties: ["openDirectory"],
    });
    if (!path) return;
    if (!path.toLowerCase().endsWith(".json")) path += ".json";
    let json = this.walletManager.exportJson(address);
    writeFileSync(path, json);
  }

  deleteWallet(address) {
    this.walletManager.deleteWallet(address);
    this.walletList.next(this.walletManager.listWallet());
  }

  generateMnemonic() {
    return generateMnemonic();
  }

  validateMnemonic(mnemonic: string) {
    return validateMnemonic(mnemonic);
  }
}
