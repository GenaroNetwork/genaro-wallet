import { Injectable } from '@angular/core';
import { STX_ADDR, WEB3_URL, LITE_WALLET, WALLET_CONFIG_PATH } from '../libs/config';
import { toHex, toWei, toBN } from 'web3-utils';
import { v1 as uuidv1 } from 'uuid';
import { BehaviorSubject } from 'rxjs';
import Web3 from 'genaro-web3';
import { GethService } from './geth.service';
import { TransactionDbService } from './transaction-db.service';
import { createHash } from 'crypto';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { newWalletManager } from 'jswallet-manager';

let web3: Web3;
let connectedWeb3: any = null;
let web3Provider: any;
const SyncTimer = 2000;
const TIMEOUT_LIMIT = 30 * 1000;

function add0x(addr: string) {
  if (!addr.startsWith('0x')) { addr = '0x' + addr; }
  return addr;
}

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

  async getWeb3Instance() {
    // if (!this.readyState) {
    //   await this.connect();
    // }
    return web3;
  }

  async connect() {
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
    }, TIMEOUT_LIMIT);
  }

  async getGas() {
    const gas = await web3.eth.getGasPrice();
    // @ts-ignore
    return web3.utils.fromWei(gas, 'Gwei');
  }

  async transfer(fromAddr: string, password: string, toAddr: string, amountInEther: string | number, gasLimit: number, gasPriceInGwei: string | number) {
    fromAddr = add0x(fromAddr);
    toAddr = add0x(toAddr);
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei');
    const amountInWei = toWei(toBN(amountInEther), 'ether');
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

  async getNonce(address) {
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
    return await this.generateTxOptions2(fromAddr, gasLimit, gasPriceInWei, JSON.stringify(inputData), STX_ADDR)
  }

  private sendTransaction(fromAddr, password, txOptions, transactionType) {
    return new Promise((res, rej) => {
      let rawTx;
      try {
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
      web3.eth.sendSignedTransaction(rawTx)
        .once('transactionHash', async hash => {
          console.log('hash get, transaction sent: ' + hash);
          await tdb.updateTxHash(txOptions.transactionId, hash);
          res();
        })
        .on('receipt', async receipt => {
          // will be fired once the receipt its mined
          console.log('receipt mined, transaction success: ');
          console.log('receipt:\n' + JSON.stringify(receipt));
          await tdb.txSuccess(txOptions.transactionId, JSON.stringify(receipt));
        })
        .on('error', async error => {
          await tdb.txError(txOptions.transactionId, error.message);
          this.alertError(error);
          rej(error.message);
        });
    });
  }

  async getBalance(address) {
    return await web3.eth.getBalance(address);
  }

  async buyBucket(address: string, password: string, spaceInGB: number, durationInDay: number, gasLimit: number, gasPriceInGwei: string | number) {
    address = add0x(address);
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei');
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

  async buyTraffic(address: string, password: string, amountInGB: number, gasLimit: number, gasPriceInGwei: string | number) {
    address = add0x(address);
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei');
    const inputData = {
      address: address,
      type: '0x4',
      traffic: amountInGB
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'BUY_TRAFFIC');
  }

  async stake(address: string, password: string, stakeGNX: number, gasLimit: number, gasPriceInGwei: string | number) {
    address = add0x(address);
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei');
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
    address = add0x(address);
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei');
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
    address = add0x(address);
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei');
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
    address = add0x(address);
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei');
    const inputData = {
      type: '0xe',
      nodeId: nodeId
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'REMOVE_NODE');
  }

  async unBrotherSingle(address: string, password: string, brotherAddr: string, gasLimit: number, gasPriceInGwei: string | number) {
    address = add0x(address);
    brotherAddr = add0x(brotherAddr);
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei');
    const inputData = {
      type: '0x11',
      address: brotherAddr
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'UNBROTHER');
  }

  async unBrotherAll(address: string, password: string, gasLimit: number, gasPriceInGwei: string | number) {
    address = add0x(address);
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei');
    const inputData = {
      type: '0x11'
    };
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'UNBROTHER_ALL');
  }

  async sendContractTransaction(address: string, password: string, contractAddr: string, inputData: string, TxType: string, gasLimit: number, gasPriceInGwei: string | number) {
    address = add0x(address);
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei');
    const txOptions = await this.generateTxOptions2(address, gasLimit, gasPriceInWei, inputData, contractAddr)
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

  alertError(error: Error) {
    if (!error) {
      return;
    } else if (!error.message) {
      console.log(error);
    } else if (error.message.indexOf('wrong passphrase') > -1) {
      this.alert.error(this.i18n.instant('ERROR.PASSWORD'));
    } else if (error.message.indexOf('insufficient funds') > -1) {
      this.alert.error(this.i18n.instant('ERROR.BALANCE'));
    } else {
      this.alert.error(error.message.toString());
    }
  }
}
