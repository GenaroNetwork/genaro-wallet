import { Injectable, ApplicationRef } from '@angular/core';
const axios = require('axios');
const secp256k1 = require('secp256k1');
const crypto = require('crypto');
const url = require('url');
import { BRIDGE_API_URL } from "../libs/config";
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

  private publicKey: string = "";
  private bucketsSig: string = "";
  private userSig: string = "";

  private async send(method, url, data, sig, pubKey) {
    if (!sig || !pubKey) {
      // return await this.send(method, url, data, sig, pubKey);
      throw new Error('missing signature or pubkey');
    }
    let res = await axios({
      method: method,
      url: BRIDGE_API_URL + url,
      data: data,
      headers: {
        'x-signature': sig,
        'x-pubkey': pubKey,
      }
    });
    if (res.status !== 200) {
      //this.askForPass();
      // return await this.send(method, url, data, sig, pubKey);
      console.error(res);
      throw new Error(`${method} ${url} error: ${res.status}`);
    }
    return res.data;
  }

  private getPublicKey(privKeyBuffer) {
    return secp256k1.publicKeyCreate(privKeyBuffer, false);
  }

  private getPayload(method, urlStr, body) {
    if (fromBody.indexOf(method) !== -1) return body;
    if (fromQuery.indexOf(method) !== -1) return url.parse(urlStr).query;
    return '';
  };

  private getHash(method, url, data) {
    let contract = new Buffer([
      method,
      url,
      this.getPayload(method, url, data),
    ].join('\n'), 'utf8');
    return crypto.createHash('sha256').update(contract).digest('hex')
  }

  private getSig(privKeyBuffer, method, url, data) {
    const hash = this.getHash(method, url, data);
    const msg = new Buffer(hash, 'hex');
    return secp256k1.sign(msg, privKeyBuffer);
  }

  async beforehandSign(password: string) {
    let walletAddr = this.walletService.wallets.current;
    if (!walletAddr.startsWith('0x')) {
      walletAddr = '0x' + walletAddr;
    }
    let privKey = this.walletService.getPrivateKey(walletAddr, password);
    if (privKey.startsWith("0x")) privKey = privKey.substr(2);
    const privKeyBuffer = new Buffer(privKey, 'hex');
    const publicKeyBuffer = this.getPublicKey(privKeyBuffer);
    this.publicKey = publicKeyBuffer.toString('hex');
    this.bucketsSig = secp256k1.signatureExport(this.getSig(privKeyBuffer, 'GET', '/buckets', null).signature).toString("hex");
    this.userSig = secp256k1.signatureExport(this.getSig(privKeyBuffer, 'GET', '/user/' + walletAddr, null).signature).toString("hex");
    let sig = {
      bucketsSig: this.bucketsSig,
      userSig: this.userSig,
      publicKey: this.publicKey,
    };
    let delOldSql = `DELETE FROM txeden WHERE address='${this.walletService.wallets.current}'`;
    await this.ipc.dbRun("txeden", delOldSql);
    let insertNewSql = `INSERT INTO txeden (address, tokens) VALUES ('${this.walletService.wallets.current}', '${JSON.stringify(sig)}')`
    await this.ipc.dbRun("txeden", insertNewSql);
    this.getAll();
  }

  private checkSig(force: boolean = false) {
    return new Promise(async (res, rej) => {
      if (this.bucketsSig && this.userSig && this.publicKey) res();
      let data: any = await this.ipc.dbGet("txeden", `SELECT * FROM txeden WHERE address='${this.walletService.wallets.current}'`);
      if (!data) {
        this.requestPass(force);
        rej(new Error("Need Password"));
        return;
      }
      let sigs = JSON.parse(data.tokens);
      this.publicKey = sigs.publicKey;
      this.bucketsSig = sigs.bucketsSig;
      this.userSig = sigs.userSig;
      res();
    });
  }

  private async requestPass(force: boolean = false) {
    let delOldSql = `DELETE FROM txeden WHERE address='${this.walletService.wallets.current}'`;
    await this.ipc.dbRun("txeden", delOldSql);
    if (force)
      this.requestPassword = true;
    else
      this.requestPassword = this.requestPassword === false ? true : this.requestPassword;
    this.appRef.tick();
  }

  async changeAddr(addr: string) {
    this.bucketsSig = null;
    this.userSig = null;
    this.publicKey = null;
  }

  async getAll(force: boolean = false) {
    try {
      await this.checkSig(force);
      this.getBuckets(force);
      this.getUserInfo(force);
      this.appRef.tick();
    } catch (e) {
      console.log(e);
    }
  }

  async getBuckets(force: boolean = false) {
    try {
      let buckets = await this.send('GET', '/buckets', null, this.bucketsSig, this.publicKey);
      this.bucketList = buckets;
    } catch (e) {
      if (e.message.indexOf("401") > -1)
        this.requestPass(force);
    }
  }

  async getUserInfo(force: boolean = false) {
    try {
      let user = await this.send('GET', '/user/0x' + this.walletService.wallets.current, null, this.userSig, this.publicKey);
      this.currentUser = user;
    } catch (e) {
      if (e.message.indexOf("401") > -1)
        this.requestPass(force);
    }
  }

  constructor(
    private walletService: WalletService,
    private appRef: ApplicationRef,
    private ipc: IpcService,
  ) { }
}
