import { Injectable } from '@angular/core';
import { newWalletManager, generateMnemonic, validateMnemonic } from "jswallet-manager";
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

  createWallet(mnemonic: string, password: string) {
    return wallets.importFromMnemonic(mnemonic, password);
  }

  generateMnemonic() {
    return generateMnemonic();
  }

  validateMnemonic(mnemonic: string) {
    return validateMnemonic(mnemonic);
  }
}
