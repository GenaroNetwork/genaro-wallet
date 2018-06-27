import { Injectable } from '@angular/core';
import { PRODUCT_MODE } from "../libs/config";
import * as bip39 from "bip39";
import * as hdkey from "ethereumjs-wallet/hdkey";
const DEFAULT = "en";
const COIN_TYPE = 300;
const LANGS = {
  zh: "chinese_simplified",
  en: "EN",
};
console.log(bip39.generateMnemonic(null, null, bip39.wordlists[LANGS.zh]));


@Injectable({
  providedIn: 'root'
})
export class BipService {

  genenateMnemonic(lang: string = DEFAULT) {
    let langTag = LANGS[lang] || LANGS[DEFAULT];
    return bip39.generateMnemonic(null, null, bip39.wordlists[langTag]);
  }

  validateMnemonic(mnemonic: string) {
    return bip39.validateMnemonic(mnemonic);
  }

  generateWalletNotSave(mnemonic: string, password: string, { internal = false, index = 0 }: { internal?: boolean, index?: number } = {}) {
    const seed = bip39.mnemonicToSeed(mnemonic);
    let wallet = hdkey
      .fromMasterSeed(seed)
      .derivePath(`m / 44' / ${PRODUCT_MODE ? COIN_TYPE : 1}' / 0' / ${internal ? 1 : 0}`)
      .deriveChild(index)
      .getWallet();
    return wallet.toV3(password);
  }

  constructor() { }

}
