import { Injectable, ApplicationRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
const axios = require('axios');
const secp256k1 = require('secp256k1');
const crypto = require('crypto');
const url = require('url');
import { BRIDGE_API_URL } from "../libs/config";
import { WalletService } from './wallet.service';
import { ipcRenderer } from 'electron';
import { TransactionService } from './transaction.service';

const fromBody = ['POST', 'PATCH', 'PUT'];
const fromQuery = ['GET', 'DELETE', 'OPTIONS'];

@Injectable({
  providedIn: 'root'
})
export class TxEdenService {
  public bucketList: any = null;
  public currentUser: any = null;
  public requestPassword: boolean = false;

  private publicKey: string = "";
  private bucketsSig: string = "";
  private userSig: string = "";
  private walletAddr: string = "";
  private ipcId: number = 0;

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

  beforehandSign(password: string, walletAddr: string = null) {
    if (walletAddr)
      this.walletAddr = walletAddr;
    else
      walletAddr = this.walletAddr;
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
    ipcRenderer.on(`db.txeden.run.${this.ipcId}`, () => {
      ipcRenderer.send(`db.txeden.run`, this.ipcId++, `INSERT INTO txeden (address, tokens) VALUES ('${this.walletAddr}', '${JSON.stringify(sig)}')`);
    });
    ipcRenderer.send(`db.txeden.run`, this.ipcId++, `DELETE FROM txeden WHERE address='${this.walletAddr}'`);
    this.getBuckets();
    this.getUserInfo();
  }

  private checkSig() {
    return new Promise((res, rej) => {
      if (!this.walletAddr) return;
      if (this.bucketsSig && this.userSig && this.publicKey) return;
      ipcRenderer.on(`db.txeden.get.${this.ipcId}`, async (sender, data) => {
        if (!data) {
          this.requestPassword = true;
          return;
        }
        else {
          let sigs = JSON.parse(data.tokens);
          if (!sigs.publicKey || !sigs.publicKey || !sigs.userSig) {
            this.requestPassword = true;
            return;
          }
          this.publicKey = sigs.publicKey;
          this.bucketsSig = sigs.bucketsSig;
          this.userSig = sigs.userSig;
        }
        res();
      });
      ipcRenderer.send(`db.txeden.get`, this.ipcId++, `SELECT * FROM txeden WHERE address='${this.walletAddr}'`);
    });
  }

  async changeAddr(addr: string) {
    this.walletAddr = addr;
    this.bucketsSig = null;
    this.userSig = null;
    this.publicKey = null;
  }

  async getAll() {
    await this.checkSig();
    this.getBuckets();
    this.getUserInfo();
    this.appRef.tick();
  }

  async getBuckets() {
    let buckets = await this.send('GET', '/buckets', null, this.bucketsSig, this.publicKey);
    this.bucketList = buckets;
  }

  async getUserInfo() {
    let user = await this.send('GET', '/user/0x' + this.walletAddr, null, this.userSig, this.publicKey);
    this.currentUser = user;
  }

  constructor(
    private walletService: WalletService,
    private appRef: ApplicationRef,
  ) { }
}
