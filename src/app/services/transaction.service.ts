import { Injectable } from '@angular/core';
import { STX_ADDR, WEB3_URL, LITE_WALLET } from "./../libs/config";
import { WalletService } from './wallet.service';
import { toHex, toWei, toBN } from 'web3-utils';
import { v1 as uuidv1 } from 'uuid'
import { BehaviorSubject } from 'rxjs';
import Web3 from 'genaro-web3';
import { GethService } from './geth.service';
import { TransactionDbService } from './transaction-db.service';
import { createHash } from 'crypto';
let web3: Web3;

function add0x(addr: string) {
  if (!addr.startsWith("0x")) addr = "0x" + addr;
  return addr
}

function sha256(input) {
  return createHash('sha256').update(input).digest('hex')
}
@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  ready: BehaviorSubject<boolean> = new BehaviorSubject(false);
  newBlockHeaders: BehaviorSubject<any> = new BehaviorSubject(null);
  constructor(
    private walletService: WalletService,
    private transactionDb: TransactionDbService
  ) {
    web3 = new Web3(WEB3_URL);
    web3.eth.net.isListening().then(() => { this.ready.next(true); })
      .catch(e => {
        // web3 is not connected
        if (LITE_WALLET) throw new Error("Can not connect to mordred."); // is lite wallet
        GethService.startGeth().then(() => {
          web3 = new Web3(WEB3_URL);
          this.ready.next(true);
        });
      });

    this.ready.subscribe(done => {
      if (!done) return;
      web3.eth.subscribe("newBlockHeaders", (err, bh) => {
        if (err) return;
        this.newBlockHeaders.next(bh);
      })
    });
  }

  async getGas() {
    // @ts-ignore
    return web3.utils.fromWei("4000000000", "Gwei");
  }

  async transfer(fromAddr: string, password: string, toAddr: string, amountInEther: string | number, gasLimit: number, gasPriceInGwei: string | number) {
    fromAddr = add0x(fromAddr)
    toAddr = add0x(toAddr)
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei')
    const amountInWei = toWei(toBN(amountInEther), 'ether')
    const nonceval = await this.getNonce(fromAddr)
    let txOptions = {
      gasPrice: toHex(gasPriceInWei),
      gasLimit: toHex(gasLimit),
      value: toHex(amountInWei),
      nonce: toHex(nonceval),
      from: fromAddr,
      to: toAddr
    }
    return this.sendTransaction(fromAddr, password, txOptions, 'TRANSFER')
  }

  async getNonce(address) {
    return await web3.eth.getTransactionCount(address)
  }

  private async generateTxOptions(fromAddr, gasLimit: number, gasPriceInWei: string | number, inputData: any) {
    const nonceval = await this.getNonce(fromAddr);
    return {
      gasPrice: toHex(gasPriceInWei),
      gasLimit: toHex(gasLimit),
      value: toHex(0),
      nonce: toHex(nonceval),
      from: fromAddr,
      to: STX_ADDR,
      data: JSON.stringify(inputData)
    }
  }

  private async sendTransaction(fromAddr, password, txOptions, transactionType) {
    const rawTx = this.walletService.signTransaction(fromAddr, password, txOptions)
    txOptions.transactionId = uuidv1()
    txOptions.created = Date.now()
    const tdb = this.transactionDb
    this.transactionDb.addNewTransaction(transactionType, txOptions)
    web3.eth.sendSignedTransaction(rawTx)
      .once('transactionHash', async function (hash) {
        console.log('1 hash get, transaction sent: ' + hash)
        await tdb.updateTxHash(txOptions.transactionId, hash)
      })
      .on('receipt', async function (receipt) {
        // will be fired once the receipt its mined
        console.log('3 receipt mined, transaction success: ')
        console.log('receipt:\n' + JSON.stringify(receipt))
        await tdb.txSuccess(txOptions.transactionId, JSON.stringify(receipt))
      })
      .on('error', async function (error) {
        await tdb.txError(txOptions.transactionId, error.message)
        console.log('2 error: ' + error)
        throw new Error(error.message);
      })
  }

  async getBalance(address) {
    return await web3.eth.getBalance(address)
  }

  async buyBucket(address: string, password: string, spaceInGB: number, durationInDay: number, gasLimit: number, gasPriceInGwei: string | number) {
    address = add0x(address)
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei')
    const nowTime = Math.round(Date.now() / 1000)
    const bid = sha256(uuidv1())
    const inputData = {
      address,
      type: "0x3",
      buckets: [{
        bucketId: bid,
        backup: 6,
        size: spaceInGB,
        timeStart: nowTime,
        timeEnd: nowTime + durationInDay * 86400
      }]
    }
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData)
    return this.sendTransaction(address, password, txOptions, 'BUY_BUCKET')
  }

  async buyTraffic(address: string, password: string, amountInGB: number, gasLimit: number, gasPriceInGwei: string | number) {
    address = add0x(address)
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei')
    const inputData = {
      address: address,
      type: "0x4",
      traffic: amountInGB
    }
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData)
    return this.sendTransaction(address, password, txOptions, 'BUY_TRAFFIC')
  }

  async stake(address: string, password: string, stakeGNX: number, gasLimit: number, gasPriceInGwei: string | number) {
    address = add0x(address);
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei');
    const inputData = {
      address: address,
      type: "0x1",
      stake: stakeGNX,
    }
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'STAKE_GNX');
  }

  async unStake() {
    // not avliable
  }

  async bindNode(address: string, password: string, nodeIds: string[] | Set<string>, gasLimit: number, gasPriceInGwei: string | number) {
    nodeIds = Array.from(nodeIds);
    address = add0x(address);
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei');
    const inputData = {
      type: "0x8",
      syncNode: nodeIds,
    }
    const txOptions = await this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData);
    return this.sendTransaction(address, password, txOptions, 'STAKE_GNX');
  }

  async getNodes(address: string) {
    // @ts-ignore
    return await web3.genaro.getStorageNodes(this.address);
  }

  async getHeft(address: string) {
    // @ts-ignore
    return await web3.genaro.getHeft(address, 'latest');
  }


}
