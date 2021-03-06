import { Injectable } from '@angular/core';
import { STX_ADDR, WEB3_URL, LITE_WALLET, WALLET_CONFIG_PATH } from '../libs/config';
import { toHex, toWei, toBN, isAddress } from 'web3-utils';
import { v1 as uuidv1 } from 'uuid';
import { BehaviorSubject } from 'rxjs';
import Web3 from 'genaro-web3';
import { GethService } from './geth.service';
import { TransactionDbService } from './transaction-db.service';
import { createHash } from 'crypto';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from './translate.service';
import { newWalletManager } from 'jswallet-manager';

let web3: Web3;
let connectedWeb3: any = null;
let web3Provider: any;
const SyncTimer = 2000;
const TIMEOUT_LIMIT = 30 * 1000;

function sha256(input) {
  return createHash('sha256').update(input).digest('hex');
}
@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  ready: BehaviorSubject<boolean> = new BehaviorSubject(null);
  readyState: boolean = null;
  newBlockHeaders: BehaviorSubject<any> = new BehaviorSubject(null);
  chainSyncing: any = [true, 0];
  walletManager: any;
  private newBlockHeadersTimer = null;
  private transactionCount = 0;

  constructor(
    private transactionDb: TransactionDbService,
    private alert: NzMessageService,
    private i18n: TranslateService,
  ) {
    this.walletManager = newWalletManager(WALLET_CONFIG_PATH);
    this.connect();
    this.ready.subscribe(async (state: boolean) => {
      this.readyState = state;
      if (state === null) { return; }
      if (!LITE_WALLET) { GethService.addFullNode(); }
      if (state) { this.afterConnected(); } else {
        this.newBlockHeaders.next(null);
        try {
          web3.eth.clearSubscriptions();
        } catch (e) { }
      }
    });

    this.newBlockHeaders.subscribe(bh => {
      this.keepConnect();
    });
  }

  async add0x(addr: string) {
    //if (!addr.startsWith('0x')) { addr = '0x' + addr; }
    if (!isAddress(addr)) {
      addr = await this.getAccountByName(addr);
    }
    else if (!addr.startsWith('0x')) { 
      addr = '0x' + addr; 
    }
    if (!isAddress(addr)) {
      this.alert.error("invalid address");
      throw new Error();
    }
    // addr = addr.toLowerCase();
    // if (!/^0x[0-9a-f]{40}$/.test(addr)) {
    //   this.alert.error("invalid address");
    //   throw new Error();
    // }
    return addr;
  }

  toBN2(input: any) {
    if (typeof input === "string" && /\d+\.?\d?/.test(input)) return input;
    return toBN(input);
  };

  async getWeb3Instance() {
    // if (!this.readyState) {
    //   await this.connect();
    // }
    return web3;
  }

  async connect() {
    this.resetNonce();
    this.ready.next(null);
    web3Provider = new Web3.providers.WebsocketProvider(WEB3_URL);
    web3 = new Web3(web3Provider);
    try {
      await web3.eth.net.isListening();
      this.ready.next(true);
      return;
    } catch (e) { }
    // web3 is not connected
    if (LITE_WALLET) {
      this.ready.next(false);
      throw new Error('Can not connect to mordred.'); // is lite wallet
    }
    try {
      await GethService.startGeth();
      web3 = new Web3(WEB3_URL);
      this.ready.next(true);
    } catch (e) {
      this.ready.next(false);
      throw new Error('Can not start geth.'); // is lite wallet
    }
  }

  async afterConnected() {
    this.keepConnect();
    if (connectedWeb3) { connectedWeb3.connection.close(); }
    connectedWeb3 = web3Provider;
    const baseNumber = await web3.eth.getBlockNumber();
    const syncInterval = setInterval(async () => {
      const blockNumber = await web3.eth.getBlockNumber();
      if (blockNumber === baseNumber) {
        this.chainSyncing = [true, blockNumber];
        return;
      }
      this.keepConnect();
      const syncing: any = await web3.eth.isSyncing();
      if (syncing !== false) {
        this.chainSyncing = [true, syncing.currentBlock];
        return;
      }
      clearInterval(syncInterval);
      web3.eth.subscribe('newBlockHeaders', (err, bh) => {
        if (err) { return; }
        this.newBlockHeaders.next(bh);
        // @ts-ignore
        this.chainSyncing = [false, bh.number];
      });
    }, SyncTimer);
  }

  keepConnect() {
    if (this.newBlockHeadersTimer !== null) {
      clearTimeout(this.newBlockHeadersTimer);
    }
    this.newBlockHeadersTimer = setTimeout(() => {
      this.ready.next(false);
      this.connect();
    }, TIMEOUT_LIMIT);
  }

  async getGas() {
    const gas = await web3.eth.getGasPrice();
    // @ts-ignore
    return web3.utils.fromWei(gas, 'Gwei');
  }

  async transfer(fromAddr: string, password: string, toAddr: string, amountInEther: string | number, gasLimit: number, gasPriceInGwei: string | number) {
    fromAddr = await this.add0x(fromAddr);
    toAddr = await this.add0x(toAddr);
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const amountInWei = toWei(this.toBN2(amountInEther), 'ether');
    const nonceval = await this.getNonce(fromAddr);
    const txOptions = {
      gasPrice: toHex(gasPriceInWei),
      gasLimit: toHex(gasLimit),
      value: toHex(amountInWei),
      nonce: toHex(nonceval),
      from: fromAddr,
      to: toAddr
    };
    return this.sendTransaction(fromAddr, password, txOptions, 'TRANSFER');
  }

  resetNonce() {
    this.transactionCount = 0;
  }

  async getNonce(address, force = false) {
    // if(this.transactionCount <= 0 || force) {
    //   this.transactionCount = await web3.eth.getTransactionCount(address);
    // }
    // else {
    //   this.transactionCount = this.transactionCount + 1;
    // }
    // return this.transactionCount;
    return await web3.eth.getTransactionCount(address);
  }

  private async generateTxOptions2(fromAddr, gasLimit: number, gasPriceInWei: string | number, inputData: any, toAddr: string) {
    const nonceval = await this.getNonce(fromAddr);
    return {
      gasPrice: toHex(gasPriceInWei),
      gasLimit: toHex(gasLimit),
      value: toHex(0),
      nonce: toHex(nonceval),
      from: fromAddr,
      to: toAddr,
      data: inputData
    };
  }

  private async generateTxOptions(fromAddr, gasLimit: number, gasPriceInWei: string | number, inputData: any) {
    return await this.generateTxOptions2(fromAddr, gasLimit, gasPriceInWei, JSON.stringify(inputData), STX_ADDR);
  }

  private sendTransaction(fromAddr, password, txOptions, transactionType) {
    return new Promise((res, rej) => {
      let rawTx;
      try {
        if (!this.readyState) throw new Error("chain not ready!");
        rawTx = this.walletManager.signTx(fromAddr, password, txOptions);
      } catch (e) {
        this.alertError(e);
        rej(e);
        return;
      }
      txOptions.transactionId = uuidv1();
      txOptions.created = Date.now();
      const tdb = this.transactionDb;
      this.transactionDb.addNewTransaction(transactionType, txOptions);
      let _hash = '';
      web3.eth.sendSignedTransaction(rawTx)
        .once('transactionHash', async hash => {
          await tdb.updateTxHash(txOptions.transactionId, hash);
          _hash = hash;
        })
        .on('receipt', async receipt => {
          // will be fired once the receipt its mined
          await tdb.txSuccess(txOptions.transactionId, JSON.stringify(receipt));
          res(_hash);
        })
        .on('error', async error => {
          await tdb.txError(txOptions.transactionId, error.message);
          console.error(error);
          this.alertError(error);
          rej(error.message);
        });
    });
  }

  async getBalance(address) {
    return await web3.eth.getBalance(address);
  }

  async buyBucket(address: string, password: string, spaceInGB: number, durationInDay: number, gasLimit: number, gasPriceInGwei: string | number) {
    address = await this.add0x(address);
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const nowTime = Math.round(Date.now() / 1000);
    const bid = sha256(uuidv1());
    const inputData = {
      address,
      type: '0x3',
      buckets: [{
        bucketId: bid,
        backup: 6,
        size: spaceInGB,
        timeStart: nowTime,
        timeEnd: nowTime + durationInDay * 86400
      }]
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'BUY_BUCKET');
  }

  async bucketSupplement(address: string, password: string, bucketId: string, spaceInGB: number, durationInDay: number, gasLimit: number, gasPriceInGwei: string | number) {
    address = await this.add0x(address);
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const inputData = {
      address: address,
      type: '0x29',
      size: spaceInGB,
      duration: durationInDay * 86400,
      bucketId: bucketId,
      msg: (Math.round(Date.now() / 1000)).toString()
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'BUCKET_SUPPLEMENT');
  }

  async buyTraffic(address: string, password: string, amountInGB: number, gasLimit: number, gasPriceInGwei: string | number) {
    address = await this.add0x(address);
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const inputData = {
      address: address,
      type: '0x4',
      traffic: amountInGB
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'BUY_TRAFFIC');
  }

  async stake(address: string, password: string, stakeGNX: number, gasLimit: number, gasPriceInGwei: string | number) {
    address = await this.add0x(address);
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    stakeGNX = Number(stakeGNX);
    const inputData = {
      address: address,
      type: '0x1',
      stake: stakeGNX,
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'STAKE_GNX');
  }

  async unStake(address: string, password: string, gasLimit: number, gasPriceInGwei: string | number) {
    // not avliable
    address = await this.add0x(address);
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const inputData = {
      address: address,
      type: '0xb',
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'UNSTAKE_GNX');
  }

  async getStake(address: string) {
    // @ts-ignore
    return await web3.genaro.getStake(address, 'latest');
  }

  async bindNode(address: string, password: string, token: string, gasLimit: number, gasPriceInGwei: string | number) {
    address = await this.add0x(address);
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const inputData = {
      type: '0x8',
      nodeId: token.split('--')[1],
      address: address,
      sign: token.split('--')[0],
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'BIND_NODE');
  }

  async removeNode(address: string, password: string, nodeId: string, gasLimit: number, gasPriceInGwei: string | number) {
    address = await this.add0x(address);
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const inputData = {
      type: '0xe',
      nodeId: nodeId
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'REMOVE_NODE');
  }

  async unBrotherSingle(address: string, password: string, brotherAddr: string, gasLimit: number, gasPriceInGwei: string | number) {
    address = await this.add0x(address);
    brotherAddr = await this.add0x(brotherAddr);
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const inputData = {
      type: '0x11',
      address: brotherAddr
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'UNBROTHER');
  }

  async unBrotherAll(address: string, password: string, gasLimit: number, gasPriceInGwei: string | number) {
    address = await this.add0x(address);
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const inputData = {
      type: '0x11'
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'UNBROTHER_ALL');
  }

  async shareFile(address: string, toAddress: string, password: string, price: number, fileId: string, shareId: string, gasLimit: number, gasPriceInGwei: string | number, size: number = 0, hash: string = '') {
    address = await this.add0x(address);
    toAddress = await this.add0x(toAddress);
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const inputData = {
      type: '0xf',
      synchronizeShareKey: {
        shareKey: fileId,
        shareprice: '0x' + (price * Math.pow(10, 18)).toString(16),
        status: 0,
        shareKeyId: shareId,
        recipientAddress: toAddress,
        fromAccount: address,
        mail_hash: hash,
        mail_size: size
      }
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'SHARE_FILE');
  }

  async agreeShare(address: string, password: string, shareId: string, gasLimit: number, gasPriceInGwei: string | number) {
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const inputData = {
      type: '0x14',
      synchronizeShareKey: {
        shareKeyId: shareId
      }
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'AGREE_SHARE');
  }

  async applyNick(address: string, password: string, nickName: string, gasLimit: number, gasPriceInGwei: string | number) {
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const inputData = {
      type: '0x17',
      msg: nickName
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'APPLY_NICK');
  }

  async transferNick(address: string, password: string, nickName: string, toAddress: string, gasLimit: number, gasPriceInGwei: string | number) {
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const inputData = {
      type: '0x18',
      msg: nickName,
      address: toAddress
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'TRANSFER_NICK');
  }

  async logoutNick(address: string, password: string, nickName: string, gasLimit: number, gasPriceInGwei: string | number) {
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const inputData = {
      type: '0x19',
      msg: nickName
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'LOUOUT_NICK');
  }

  async sendContractTransaction(address: string, password: string, contractAddr: string, inputData: string, TxType: string, gasLimit: number, gasPriceInGwei: string | number) {
    address = await this.add0x(address);
    const gasPriceInWei = toWei(this.toBN2(gasPriceInGwei), 'gwei');
    const txOptions = await this.generateTxOptions2(address, gasLimit, gasPriceInWei, inputData, contractAddr);
    return this.sendTransaction(address, password, txOptions, TxType);
  }

  async getNodes(address: string) {
    // @ts-ignore
    return await web3.genaro.getStorageNodes(address);
  }

  async getAddressByNodeId(nodeId: string) {
    // @ts-ignore
    return await web3.genaro.getAddressByNode(nodeId);
  }

  async getHeft(address: string) {
    // @ts-ignore
    return await web3.genaro.getHeft(address, 'latest');
  }

  async getAccountByName(name: string) {
    // @ts-ignore
    return await web3.genaro.getAccountByName(name, 'latest');
  }

  async getNamePrice(name: string) {
    // @ts-ignore
    return await web3.genaro.getNamePrice(name);
  }

  alertError(error: Error) {
    if (!error) {
      return;
    } else if (!error.message) {
      console.error(error);
    } else if (error.message.indexOf("chain not ready") > -1) {
      this.alert.error(this.i18n.instant('ERROR.CHAIN_NOT_READY'));
    } else if (error.message.indexOf('wrong passphrase') > -1) {
      this.alert.error(this.i18n.instant('ERROR.PASSWORD'));
    } else if (error.message.indexOf('insufficient funds') > -1) {
      this.alert.error(this.i18n.instant('ERROR.BALANCE'));
    } else if (error.message.indexOf('Returned error: the input node have been bound by themselves or others') > -1) {
      this.alert.error(this.i18n.instant('ERROR.NODE_BOUND'));
    } else {
      this.alert.error(error.message.toString());
    }
  }
}
