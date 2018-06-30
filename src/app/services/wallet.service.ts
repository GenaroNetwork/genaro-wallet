import { Injectable } from '@angular/core';
import { newWalletManager, generateMnemonic, validateMnemonic, signTx } from "jswallet-manager";
import { WALLET_CONFIG_PATH } from "../libs/config";
import { BehaviorSubject } from 'rxjs';
import { nextTick } from 'q';



@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private wallets: any;

  public walletList: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public currentWallet: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  constructor() {
    this.wallets = newWalletManager(WALLET_CONFIG_PATH);
    this.walletList.next(this.wallets.listWallet());
    this.walletList.subscribe(walletList => {
      if (walletList.length === 0) {
        this.currentWallet = null;
        return;
      }
      this.currentWallet.subscribe(current => {
        if (current && walletList.find(wallet => wallet.address === current.address) !== void 0) return;
        nextTick(() => {
          this.currentWallet.next(walletList[0]);
        });
      }).unsubscribe();
    });
  }


  createWallet(mnemonic: string, password: string, name: string): Promise<any> {
    return new Promise(res => {
      setTimeout(() => {
        let wallet = this.wallets.importFromMnemonic(mnemonic, password, name);
        this.walletList.next(this.wallets.listWallet());
        res(wallet);
      }, 0);
    });
  }

  importWallet(json: any, password, name) {
    let wallet = this.wallets.importFromJson(json, password, name);
    this.walletList.next(this.wallets.listWallet());
    return wallet;
  }

  /**
   * @param {string} name 
   * @returns {boolean} true 代表该名字存在
   */
  checkName(name: string) {
    return this.wallets.listWallet().find(wallet => wallet.name === name) !== void 0;
  }

  changeName(address: string, newName: string) {
    this.wallets.renameWallet(address, newName);
    this.walletList.next(this.wallets.listWallet());
  }

  /**
   * 
   * @param {string} prefix 前缀，根据 i18n 决定
   */
  generateName(prefix: string = "Wallet") {
    let i = 0;
    let wallets = this.wallets.listWallet();
    while (wallets.find(wallet => wallet.name === `${prefix} ${++i}`) !== void 0) { }
    return `${prefix} ${i}`;
  }

  generateMnemonic() {
    return generateMnemonic();
  }

  validateMnemonic(mnemonic: string) {
    return validateMnemonic(mnemonic);
  }

  signTransaction(address: string, password: string, txParams: object) {
    return signTx(address, password, txParams)
  }
}
