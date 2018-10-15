import { Injectable, ApplicationRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
const secp256k1 = require('secp256k1');
const crypto = require('crypto');
const url = require('url');
const cryptico = require('cryptico');
import { BRIDGE_API_URL } from '../libs/config';
import { WalletService } from './wallet.service';
import { IpcService } from './ipc.service';

const fromBody = ['POST', 'PATCH', 'PUT'];
const fromQuery = ['GET', 'DELETE', 'OPTIONS'];

@Injectable({
  providedIn: 'root'
})
export class TxEdenService {
  public bucketList: any = [];
  public shareFiles: BehaviorSubject<any> = new BehaviorSubject({});
  public currentUser: any = {};
  public requestPassword: boolean = null;

  public RSAPrivateKey: any = {};

  private publicKey = '';
  private bucketsSig = '';
  private userSig = '';
  private shareSig = '';

  private async send(method, url, data, sig, pubKey) {
    if (!sig || !pubKey) {
      // return await this.send(method, url, data, sig, pubKey);
      throw new Error('missing signature or pubkey');
    }
    const res = await fetch(BRIDGE_API_URL + url, {
      method: method,
      headers: {
        'x-signature': sig,
        'x-pubkey': pubKey,
      },
      body: data,
    });
    if (!res.ok || res.status !== 200) {
      // this.askForPass();
      // return await this.send(method, url, data, sig, pubKey);
      console.error(res);
      throw new Error(`${method} ${url} error: ${res.status}`);
    }
    return await res.json();
  }

  private getPublicKey(privKeyBuffer) {
    return secp256k1.publicKeyCreate(privKeyBuffer, false);
  }

  private getPayload(method, urlStr, body) {
    if (fromBody.indexOf(method) !== -1) { return body; }
    if (fromQuery.indexOf(method) !== -1) { return url.parse(urlStr).query; }
    return '';
  }

  private getHash(method, url, data) {
    const contract = new Buffer([
      method,
      url,
      this.getPayload(method, url, data),
    ].join('\n'), 'utf8');
    return crypto.createHash('sha256').update(contract).digest('hex');
  }

  private getSig(privKeyBuffer, method, url, data) {
    const hash = this.getHash(method, url, data);
    const msg = new Buffer(hash, 'hex');
    return secp256k1.sign(msg, privKeyBuffer);
  }

  async beforehandSign(password: string, address: string = null) {
    let walletAddr = address || this.walletService.wallets.current;
    if (!walletAddr.startsWith('0x')) {
      walletAddr = '0x' + walletAddr;
    }
    let privKey = this.walletService.getPrivateKey(walletAddr, password);
    if (privKey.startsWith('0x')) { privKey = privKey.substr(2); }
    this.RSAPrivateKey[walletAddr] = cryptico.generateRSAKey(privKey, '1024');
    const privKeyBuffer = new Buffer(privKey, 'hex');
    const publicKeyBuffer = this.getPublicKey(privKeyBuffer);
    this.publicKey = publicKeyBuffer.toString('hex');
    this.bucketsSig = secp256k1.signatureExport(this.getSig(privKeyBuffer, 'GET', '/buckets', null).signature).toString('hex');
    this.userSig = secp256k1.signatureExport(this.getSig(privKeyBuffer, 'GET', '/user/' + walletAddr, null).signature).toString('hex');
    this.shareSig = secp256k1.signatureExport(this.getSig(privKeyBuffer, 'GET', '/users/' + walletAddr + '/shares', null).signature).toString('hex');
    const sig = {
      bucketsSig: this.bucketsSig,
      userSig: this.userSig,
      shareSig: this.shareSig,
      publicKey: this.publicKey,
    };
    const delOldSql = `DELETE FROM txeden WHERE address='${this.walletService.wallets.current}'`;
    await this.ipc.dbRun('txeden', delOldSql);
    const insertNewSql = `INSERT INTO txeden (address, tokens) VALUES ('${this.walletService.wallets.current}', '${JSON.stringify(sig)}')`;
    await this.ipc.dbRun('txeden', insertNewSql);
    this.getAll(false, password);
  }

  clearAllSig() {
    this.bucketsSig = null;
    this.userSig = null;
    this.shareSig = null;
    this.publicKey = null;
  }

  private async checkSig(force: boolean = false) {
    if (this.bucketsSig && this.userSig && this.shareSig && this.publicKey) { return; }
    const data: any = await this.ipc.dbGet('txeden', `SELECT * FROM txeden WHERE address='${this.walletService.wallets.current}'`);
    if (!data) {
      this.requestPass(force);
      throw new Error('Need Password');
    }
    const sigs = JSON.parse(data.tokens);
    this.publicKey = sigs.publicKey;
    this.bucketsSig = sigs.bucketsSig;
    this.userSig = sigs.userSig;
    this.shareSig = sigs.shareSig;
  }

  private async requestPass(force: boolean = false) {
    const delOldSql = `DELETE FROM txeden WHERE address='${this.walletService.wallets.current}'`;
    await this.ipc.dbRun('txeden', delOldSql);
    if (force) {
      this.requestPassword = true;
    } else {
      this.requestPassword = this.requestPassword === null ? true : this.requestPassword;
    }
  }

  async changeAddr(addr: string) {
    this.bucketsSig = null;
    this.userSig = null;
    this.shareSig = null;
    this.publicKey = null;
  }

  async getAll(force: boolean = false, password: string = '') {
    try {
      await this.checkSig(force);
      await this.getBuckets(force);
      await this.getUserInfo(force, password);
      await this.getUserShares(force);
    } catch (e) {
      console.log(e);
    }
  }

  async getBuckets(force: boolean = false) {
    try {
      const buckets = await this.send('GET', '/buckets', null, this.bucketsSig, this.publicKey);
      this.bucketList = buckets;
    } catch (e) {
      if (e.message.indexOf('401') > -1) {
        this.requestPass(force);
      }
    }
  }

  async getUserInfo(force: boolean = false, password: string = '') {
    try {
      let walletAddr = this.walletService.wallets.current;
      if (!walletAddr.startsWith('0x')) {
        walletAddr = '0x' + walletAddr;
      }
      const user = await this.send('GET', '/user/' + walletAddr, null, this.userSig, this.publicKey);
      this.currentUser = user;
      if(password && this.currentUser && !this.currentUser.filePublicKey) {
        let RSAPublicKeyString = cryptico.publicKeyString(this.RSAPrivateKey[walletAddr]);
        await this.walletService.putFileKey(walletAddr, password, RSAPublicKeyString);
      }
    } catch (e) {
      if (e.message.indexOf('401') > -1) {
        this.requestPass(force);
      }
    }
  }

  async getUserShares(force: boolean = false) {
    try {
      const shares = await this.send('GET', '/users/0x' + this.walletService.wallets.current + '/shares', null, this.shareSig, this.publicKey);
      this.shareFiles.next(shares || {});
    } catch (e) {
      if (e.message.indexOf('401') > -1) {
        this.requestPass(force);
      }
    }
  }

  constructor(
    private walletService: WalletService,
    private appRef: ApplicationRef,
    private ipc: IpcService,
  ) { }
}
