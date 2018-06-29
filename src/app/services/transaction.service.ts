import { Injectable } from '@angular/core';
import { WEB3_URL, STX_ADDR } from "./../libs/config";
import { WalletService } from './wallet.service';
import {toHex, toWei, toBN} from 'web3-utils';
import {v1 as uuidv1} from 'uuid'
import Web3 from 'genaro-web3';
import { Observable } from 'rxjs';
let web3: any = new Web3(WEB3_URL);

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private walletService: WalletService) { }

  async transfer(fromAddr: string, password: string, toAddr: string, amountInEther: string | number, gasLimit: number, gasPriceInGwei: string | number) {
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
    const rawTx = this.walletService.signTransaction(fromAddr, password, txOptions)
    return this.sendTransaction(rawTx)
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
      data: inputData
    }
  }

  private sendTransaction(rawTx) {
    return new Observable((observer) => {
      web3.eth.sendSignedTransaction(rawTx).once('transactionHash', function (hash) {
        console.log('1 hash get, transaction sent: ' + hash)
        observer.next({
          event: 'TX_HASH',
          param: hash
        })
      }).on('receipt', async function (receipt) {
        // will be fired once the receipt its mined
        console.log('3 receipt mined, transaction success: ')
        console.log('receipt:\n' + JSON.stringify(receipt))
        observer.next({
          event: 'TX_RECEIPT',
          param: receipt
        })
        observer.complete()
        //const txx = await web3.eth.getTransaction(receipt.transactionHash)
        //console.log('transaction:\n' + JSON.stringify(txx))
      }).on('error', function (error) {
        console.log('2 error: ' + error)
        observer.error(error)
      })
    })
  }

  async getBalance(address) {
    return await web3.eth.getBalance(address)
  }

  buyBucket(address: string, password: string, spaceInGB: number, durationInDay: number, gasLimit: number, gasPriceInGwei: string | number) {
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei')
    const nowTime = Math.round(Date.now() / 1000)
    const inputData = {
        address,
        type: "0x3",
        buckets: [{
            bucketId: uuidv1(),
            backup: 6,
            size: spaceInGB,
            timeStart: nowTime,
            timeEnd: nowTime + durationInDay * 86400
        }]
    }
    const txOptions = this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData)
    const rawTx = this.walletService.signTransaction(address, password, txOptions)
    return this.sendTransaction(rawTx)
  }

  buyTraffic(address:string, password: string, amountInGB: number, gasLimit: number, gasPriceInGwei: string | number) {
    const gasPriceInWei = toWei(toBN(gasPriceInGwei), 'gwei')
    const inputData = {
        address: address,
        type: "0x4",
        traffic: amountInGB
    }
    const txOptions = this.generateTxOptions(address, gasLimit, gasPriceInWei, inputData)
    const rawTx = this.walletService.signTransaction(address, password, txOptions)
    return this.sendTransaction(rawTx)
  }
}
