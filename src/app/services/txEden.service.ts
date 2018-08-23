import { Injectable, ApplicationRef } from '@angular/core';
const secp256k1 = require('secp256k1');
const crypto = require('crypto');
const url = require('url');
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
  public currentUser: any = {};
  public requestPassword: boolean = null;

  private publicKey = '';
  private bucketsSig = '';
  private userSig = '';

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
    const privKeyBuffer = new Buffer(privKey, 'hex');
    const publicKeyBuffer = this.getPublicKey(privKeyBuffer);
    this.publicKey = publicKeyBuffer.toString('hex');
    this.bucketsSig = secp256k1.signatureExport(this.getSig(privKeyBuffer, 'GET', '/buckets', null).signature).toString('hex');
    this.userSig = secp256k1.signatureExport(this.getSig(privKeyBuffer, 'GET', '/user/' + walletAddr, null).signature).toString('hex');
    const sig = {
      bucketsSig: this.bucketsSig,
      userSig: this.userSig,
      publicKey: this.publicKey,
    };
    const delOldSql = `DELETE FROM txeden WHERE address='${this.walletService.wallets.current}'`;
    await this.ipc.dbRun('txeden', delOldSql);
    const insertNewSql = `INSERT INTO txeden (address, tokens) VALUES ('${this.walletService.wallets.current}', '${JSON.stringify(sig)}')`;
    await this.ipc.dbRun('txeden', insertNewSql);
    this.getAll();
  }

  clearAllSig() {
    this.bucketsSig = null;
    this.userSig = null;
    this.publicKey = null;
  }

  private async checkSig(force: boolean = false) {
    if (this.bucketsSig && this.userSig && this.publicKey) { return; }
    const data: any = await this.ipc.dbGet('txeden', `SELECT * FROM txeden WHERE address='${this.walletService.wallets.current}'`);
    if (!data) {
      this.requestPass(force);
      throw new Error('Need Password');
    }
    const sigs = JSON.parse(data.tokens);
    this.publicKey = sigs.publicKey;
    this.bucketsSig = sigs.bucketsSig;
    this.userSig = sigs.userSig;
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
    this.publicKey = null;
  }

  async getAll(force: boolean = false) {
    try {
      await this.checkSig(force);
      await this.getBuckets(force);
      await this.getUserInfo(force);
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

  async getUserInfo(force: boolean = false) {
    try {
      const user = await this.send('GET', '/user/0x' + this.walletService.wallets.current, null, this.userSig, this.publicKey);
      this.currentUser = user;
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
