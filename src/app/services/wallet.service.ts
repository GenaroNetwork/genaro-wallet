import { Injectable } from '@angular/core';
import { generateMnemonic, validateMnemonic, addressFromMnemonic } from 'jswallet-manager';
import { BehaviorSubject } from 'rxjs';
import { remote } from 'electron'; // 有时间的话把界面功能统一挪到 component 中，service 不要涉及任何界面功能
import { TranslateService } from './translate.service';
import { writeFileSync } from 'fs';
import { TransactionService } from './transaction.service';
import { NickService } from './nick.service';
import { SENTINEL_API, BRIDGE_API_URL } from '../libs/config';
import { NzMessageService } from 'ng-zorro-antd';
const secp256k1 = require('secp256k1');
const crypto = require('crypto');

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private walletManager: any;
  walletList: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  currentWallet: BehaviorSubject<any> = new BehaviorSubject<any>(void 0);
  wallets: any = {
    current: null,
    currentNick: null,
    all: {},
  };
  balances: any = {};

  constructor(
    private i18n: TranslateService,
    private txService: TransactionService,
    private alert: NzMessageService,
    private nickService: NickService
  ) {
    this.walletManager = this.txService.walletManager;
    this.walletList.next(this.walletManager.listWallet());
    this.walletList.subscribe(walletList => {
      // 删除不存在的钱包的签名
      const addrArr = walletList.map(wallet => `'${wallet.address}'`);
      const addrs = addrArr.join(',');

      // 更改当前钱包
      this.wallets.all = walletList;
      if (walletList.length === 0) {
        this.currentWallet.next(null);
        return;
      }
      const currentAddress = this.wallets.current;
      if (currentAddress && walletList.find(wallet => wallet.address === currentAddress)) { return; }
      this.currentWallet.next(walletList[0]);
    });

    this.currentWallet.subscribe(async wallet => {
      if (wallet) {
        this.wallets.current = wallet.address;
        this.wallets.currentNick = await this.nickService.getNick('0x' + wallet.address);
      } else {
        this.wallets.current = null;
        this.wallets.currentNick = null;
      }
    });

    this.txService.newBlockHeaders.subscribe(async bh => {
      if (!bh) { return; }
      const address = this.wallets.current;
      if (!address) { return; }
      const balance = await this.txService.getBalance(address);
      this.balances[address] = balance;
    });
  }

  async createWallet(mnemonic: string, password: string, name: string): Promise<any> {
    const wallet = this.walletManager.importFromMnemonic(mnemonic, password, this.setNewWalletName.bind(this), true);
    // this.sendNick(wallet.address, password, wallet.name);
    this.walletList.next(this.walletManager.listWallet());
    return wallet;
  }

  importWallet(json: any, password, name) {
    const wallet = this.walletManager.importFromJson(json, password, this.setNewWalletName.bind(this), true);
    this.walletList.next(this.walletManager.listWallet());
    return wallet;
  }

  private setNewWalletName(v3json) {
    const address = v3json.address;
    return this.i18n.instant('WALLETNEW.WALLET_NAME_PREFIX') + ' 0x' + address.slice(0, 2);
  }

  private async sendNick(address, password, name) {
    const method = 'POST';
    if (!address.startsWith('0x')) {
      address = '0x' + address;
    }
    const url = '/farmer/' + address + '/nick';
    let privKey = this.getPrivateKey(address, password);
    if (privKey.startsWith('0x')) { privKey = privKey.substr(2); }
    const privKeyBuffer = Buffer.from(privKey, 'hex');
    const publicKeyBuffer = secp256k1.publicKeyCreate(privKeyBuffer, false);
    const hash = this.getHash(method, url, name);
    const msg = Buffer.from(hash, 'hex');
    const sigObj = secp256k1.sign(msg, privKeyBuffer);
    await fetch(SENTINEL_API + url, {
      method: method,
      body: name,
      headers: {
        'x-signature': secp256k1.signatureExport(sigObj.signature).toString('hex'),
        'x-pubkey': publicKeyBuffer.toString('hex')
      }
    });
  }

  async putFileKey(address, password, fileKey) {
    const method = 'PUT';
    if (!address.startsWith('0x')) {
      address = '0x' + address;
    }
    const url = '/users/' + address + '/filekey';
    let privKey = this.getPrivateKey(address, password);
    if (privKey.startsWith('0x')) { privKey = privKey.substr(2); }
    const privKeyBuffer = Buffer.from(privKey, 'hex');
    const publicKeyBuffer = secp256k1.publicKeyCreate(privKeyBuffer, false);
    const data = {
      filePublicKey: fileKey
    }
    const dataStr = JSON.stringify(data);
    const hash = this.getHash(method, url, dataStr);
    const msg = Buffer.from(hash, 'hex');
    const sigObj = secp256k1.sign(msg, privKeyBuffer);
    let res = await fetch(BRIDGE_API_URL + url, {
      method: method,
      body: dataStr,
      headers: {
        'x-signature': secp256k1.signatureExport(sigObj.signature).toString('hex'),
        'x-pubkey': publicKeyBuffer.toString('hex')
      }
    });
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async shareFile(address, password, bucketEntryId, toAddress, price, fileName, key) {
    const method = 'POST';
    if (!address.startsWith('0x')) {
      address = '0x' + address;
    }
    if (!toAddress.startsWith('0x')) {
      toAddress = '0x' + toAddress;
    }
    const url = '/shares';
    let privKey = this.getPrivateKey(address, password);
    if (privKey.startsWith('0x')) { privKey = privKey.substr(2); }
    const privKeyBuffer = Buffer.from(privKey, 'hex');
    const publicKeyBuffer = secp256k1.publicKeyCreate(privKeyBuffer, false);
    const data = {
      bucketEntryId: bucketEntryId,
      toAddress: toAddress,
      price: price,
      fileName: fileName,
      key: key.key.cipher,
      ctr: key.ctr.cipher
    }
    const dataStr = JSON.stringify(data);
    const hash = this.getHash(method, url, dataStr);
    const msg = Buffer.from(hash, 'hex');
    const sigObj = secp256k1.sign(msg, privKeyBuffer);
    let res = await fetch(BRIDGE_API_URL + url, {
      method: method,
      body: dataStr,
      headers: {
        'x-signature': secp256k1.signatureExport(sigObj.signature).toString('hex'),
        'x-pubkey': publicKeyBuffer.toString('hex')
      }
    });
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async getShareExist(shareId) {
    let res = await fetch(BRIDGE_API_URL + '/share/' + shareId + '/exist', {
      method: 'GET'
    });
    try {
      let data = await res.json();
      return data.exist;
    } catch (e) {
      return false;
    }
  }

  async agreeShare(address, password, shareId, bucketId) {
    const method = 'PUT';
    if (!address.startsWith('0x')) {
      address = '0x' + address;
    }
    const url = '/shares/' + shareId + '/agree';
    let privKey = this.getPrivateKey(address, password);
    if (privKey.startsWith('0x')) { privKey = privKey.substr(2); }
    const privKeyBuffer = Buffer.from(privKey, 'hex');
    const publicKeyBuffer = secp256k1.publicKeyCreate(privKeyBuffer, false);
    const data = {
      bucketId: bucketId
    }
    const dataStr = JSON.stringify(data);
    const hash = this.getHash(method, url, dataStr);
    const msg = Buffer.from(hash, 'hex');
    const sigObj = secp256k1.sign(msg, privKeyBuffer);
    let res = await fetch(BRIDGE_API_URL + url, {
      method: method,
      body: dataStr,
      headers: {
        'x-signature': secp256k1.signatureExport(sigObj.signature).toString('hex'),
        'x-pubkey': publicKeyBuffer.toString('hex')
      }
    });
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async rejectShare(address, password, shareId) {
    const method = 'PUT';
    if (!address.startsWith('0x')) {
      address = '0x' + address;
    }
    const url = '/shares/' + shareId + '/reject';
    let privKey = this.getPrivateKey(address, password);
    if (privKey.startsWith('0x')) { privKey = privKey.substr(2); }
    const privKeyBuffer = Buffer.from(privKey, 'hex');
    const publicKeyBuffer = secp256k1.publicKeyCreate(privKeyBuffer, false);
    const hash = this.getHash(method, url, '');
    const msg = Buffer.from(hash, 'hex');
    const sigObj = secp256k1.sign(msg, privKeyBuffer);
    let res = await fetch(BRIDGE_API_URL + url, {
      method: method,
      body: '',
      headers: {
        'x-signature': secp256k1.signatureExport(sigObj.signature).toString('hex'),
        'x-pubkey': publicKeyBuffer.toString('hex')
      }
    });
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async deleteShare(address, password, shareId) {
    const method = 'PUT';
    if (!address.startsWith('0x')) {
      address = '0x' + address;
    }
    const url = '/shares/' + shareId + '/delete';
    let privKey = this.getPrivateKey(address, password);
    if (privKey.startsWith('0x')) { privKey = privKey.substr(2); }
    const privKeyBuffer = Buffer.from(privKey, 'hex');
    const publicKeyBuffer = secp256k1.publicKeyCreate(privKeyBuffer, false);
    const hash = this.getHash(method, url, '');
    const msg = Buffer.from(hash, 'hex');
    const sigObj = secp256k1.sign(msg, privKeyBuffer);
    let res = await fetch(BRIDGE_API_URL + url, {
      method: method,
      body: '',
      headers: {
        'x-signature': secp256k1.signatureExport(sigObj.signature).toString('hex'),
        'x-pubkey': publicKeyBuffer.toString('hex')
      }
    });
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async setInOutbox(address, password, bucketId, type) {
    const method = 'PUT';
    if (!address.startsWith('0x')) {
      address = '0x' + address;
    }
    const url = '/buckets/' + bucketId + '/type';
    let privKey = this.getPrivateKey(address, password);
    if (privKey.startsWith('0x')) { privKey = privKey.substr(2); }
    const privKeyBuffer = Buffer.from(privKey, 'hex');
    const publicKeyBuffer = secp256k1.publicKeyCreate(privKeyBuffer, false);
    const data = {
      type: type
    };
    const dataStr = JSON.stringify(data);
    const hash = this.getHash(method, url, dataStr);
    const msg = Buffer.from(hash, 'hex');
    const sigObj = secp256k1.sign(msg, privKeyBuffer);
    let res = await fetch(BRIDGE_API_URL + url, {
      method: method,
      body: dataStr,
      headers: {
        'x-signature': secp256k1.signatureExport(sigObj.signature).toString('hex'),
        'x-pubkey': publicKeyBuffer.toString('hex')
      }
    });
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  private getHash(method, url, data) {
    const contract = Buffer.from([
      method,
      url,
      data
    ].join('\n'), 'utf8');
    return crypto.createHash('sha256').update(contract).digest('hex');
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
    this.alert.success(this.i18n.instant('WALLET.CHANGE_PASSWORD_SUCCESS'));
  }

  changePasswordByMnemonic(address: string, mnemonic: string, newPassword: string) {
    const addr = addressFromMnemonic(mnemonic);
    if (addr != '0x' + address) {
      throw new Error('mnemonic error');
    }
    this.walletManager.importFromMnemonic(mnemonic, newPassword, '', true);
    this.walletList.next(this.walletManager.listWallet());
  }

  getPrivateKey(addr: string, pass: string) {
    return this.walletManager.exportPrivateKey(addr, pass);
  }

  /**
   *
   * @param {string} prefix 前缀，根据 i18n 决定
   */
  generateName(prefix: string = 'Wallet') {
    let i = 0;
    const wallets = this.walletManager.listWallet();
    while (wallets.find(wallet => wallet.name === `${prefix} ${++i}`) !== void 0) { }
    return `${prefix} ${i}`;
  }

  validatePassword(address: string, password: string) {
    return this.walletManager.validatePassword(address, password);
  }

  getJson(address: string) {
    return this.walletManager.exportJson(address);
  }

  exportJson(address: string) {
    // @ts-ignore
    let path = remote.dialog.showSaveDialog(remote.getCurrentWindow(), {
      title: this.i18n.instant('COMMON.SELECT_SAVE_PATH'),
      properties: ['openDirectory'],
    });
    if (!path) { return; }
    if (!path.toLowerCase().endsWith('.json')) { path += '.json'; }
    const json = this.walletManager.exportJson(address);
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
