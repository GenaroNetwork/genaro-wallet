import { Injectable } from '@angular/core';
import { newWalletManager, generateMnemonic, validateMnemonic, signTx } from "jswallet-manager";
import { WALLET_CONFIG_PATH } from "../libs/config";
let wallets = newWalletManager(WALLET_CONFIG_PATH);
let walletList = wallets.listWallet();
let walletNames = new Set;
let walletAddrs = new Set;

walletList.forEach(wallet => {
  walletNames.add(wallet.name);
  walletAddrs.add(wallet.address);
});

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  constructor() {
  }

  createWallet(mnemonic: string, password: string, name: string): Promise<any> {
    return new Promise(res => {
      let wallet = wallets.importFromMnemonic(mnemonic, password, name);
      res(wallet);
    });
  }

  /**
   * @param {string} name 
   * @returns {boolean} true 代表该名字存在
   */
  checkName(name: string) {
    return walletNames.has(name);
  }

  changeName(address: string, newName: string) {
    wallets.renameWallet(address, newName);
  }

  /**
   * 
   * @param {string} prefix 前缀，根据 i18n 决定
   */
  generateName(prefix: string = "Wallet") {
    let i = 0;
    while (walletNames.has(`${prefix} ${++i}`)) { }
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
