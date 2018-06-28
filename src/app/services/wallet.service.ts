import { Injectable } from '@angular/core';
import { newWalletManager, generateMnemonic, validateMnemonic } from "jswallet-manager";
import { WALLET_CONFIG_PATH } from "../libs/config";

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  wallet: any;
  constructor() {
    this.wallet = newWalletManager(WALLET_CONFIG_PATH)
  }

  generateMnemonic() {
    return generateMnemonic();
  }

  validateMnemonic(mnemonic: string) {
    return validateMnemonic(mnemonic);
  }
}
