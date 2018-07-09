import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
const axios = require('axios');
const secp256k1 = require('secp256k1');
const crypto = require('crypto');
const url = require('url');
import { BRIDGE_API_URL } from "../libs/config";

const fromBody = ['POST', 'PATCH', 'PUT'];
const fromQuery = ['GET', 'DELETE', 'OPTIONS'];

@Injectable({
  providedIn: 'root'
})
export class TxEdenService {
  public bucketList: BehaviorSubject<any> = new BehaviorSubject<any>(void 0);
  public currentUser: BehaviorSubject<any> = new BehaviorSubject<any>(void 0);

  private publicKey: string = "";
  private bucketsSig: string = "";
  private userSig: string = "";
  private walletAddr: string = "";

  private async send(method, url, data, sig, pubKey) {
    if (!sig || !pubKey) {
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
      throw new Error(`${method} ${url} error: ${res.status}`);
    }
    return res.data;
  }

  private getPublicKey(privKeyBuffer) {
    return secp256k1.publicKeyCreate(privKeyBuffer);
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
      this.getPayload(method, url, data)
    ].join('\n'), 'utf8');
    return crypto.createHash('sha256').update(contract).digest('hex')
  }

  private getSig(privKeyBuffer, method, url, data) {
    const hash = this.getHash(method, url, data);
    const msg = new Buffer(hash, 'hex');
    return secp256k1.sign(msg, privKeyBuffer);
  }

  beforehandSign(privKey, walletAddr) {
    this.walletAddr = walletAddr;
    const privKeyBuffer = new Buffer(privKey, 'hex');
    const publicKeyBuffer = this.getPublicKey(privKeyBuffer);
    this.publicKey = publicKeyBuffer.toString('hex');
    this.bucketsSig = this.getSig(privKeyBuffer, 'GET', '/buckets', null).toString(16);
    this.userSig = this.getSig(privKeyBuffer, 'GET', '/user/' + walletAddr, null).toString(16);
  }

  async getBuckets() {
    let buckets = await this.send('GET', '/buckets', null, this.bucketsSig, this.publicKey);
    this.bucketList.next(buckets);
  }

  async getUserInfo() {
    let user = await this.send('GET', '/user/' + this.walletAddr, null, this.userSig, this.publicKey);
    this.currentUser.next(user);
  }

  constructor(
  ) { }
}
