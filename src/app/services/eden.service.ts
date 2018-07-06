import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
const axios = require('axios');
const secp256k1 = require('secp256k1');
const crypto = require('crypto');
const url = require('url');
import { BRIDGE_API_URL } from "./../libs/config";

const fromBody = ['POST', 'PATCH', 'PUT'];
const fromQuery = ['GET', 'DELETE', 'OPTIONS'];

function _getPayload(method, urlStr, body) {
  if (fromBody.indexOf(method) !== -1) {
    return body;
  }

  if (fromQuery.indexOf(method) !== -1) {
    return url.parse(urlStr).query;
  }

  return '';
};

function _getHash(method, url, data) {
  let contract = new Buffer([
    method,
    url,
    _getPayload(method, url, data)
  ].join('\n'), 'utf8');
  return crypto.createHash('sha256').update(contract).digest('hex')
}

function send(method, url, data, sig, pubKey, callback) {
  if (!sig || !pubKey) {
    return callback('missing signature or pubkey');
  }
  axios({
    method: method,
    url: BRIDGE_API_URL + url,
    data: data,
    headers: {
      'x-signature': sig,
      'x-pubkey': pubKey
    }
  }).then(function (res) {
    if (res.status !== 200) {
      return callback(`${method} ${url} error: ${res.status}`);
    }
    callback(null, res.data);
  }).catch(function (err) {
    callback(err);
  });
}

function getPublicKey(privKeyBuffer) {
  return secp256k1.publicKeyCreate(privKeyBuffer);
}

function getSig(privKeyBuffer, method, url, data) {
  const hash = _getHash(method, url, data);
  const msg = new Buffer(hash, 'hex');
  return secp256k1.sign(msg, privKeyBuffer);
}

@Injectable({
  providedIn: 'root'
})
export class EdenService {
  public bucketList: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  public currentUser: BehaviorSubject<any> = new BehaviorSubject<any>(void 0);

  private publicKey: string = "";
  private bucketsSig: string = "";
  private userSig: string = "";
  private walletAddr: string = "";

  beforehandSign(privKey, walletAddr) {
    this.walletAddr = walletAddr;
    const privKeyBuffer = new Buffer(privKey, 'hex');
    const publicKeyBuffer = getPublicKey(privKeyBuffer);
    this.publicKey = publicKeyBuffer.toString('hex');
    this.bucketsSig = getSig(privKeyBuffer, 'GET', '/buckets', null).toString('hex');
    this.userSig = getSig(privKeyBuffer, 'GET', '/user/' + walletAddr, null).toString('hex');
  }

  getBuckets() {
    send('GET', '/buckets', null, this.bucketsSig, this.publicKey, (err, buckets) => {
      if (err) {
        return alert(err);
      }
      this.bucketList.next(buckets);
    });
  }

  getUserInfo() {
    send('GET', '/user/' + this.walletAddr, null, this.userSig, this.publicKey, (err, user) => {
      if (err) {
        return alert(err);
      }
      this.currentUser.next(user);
    });
  }

  constructor(
  ) { }
}
