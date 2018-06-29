import { Injectable } from '@angular/core';
import { WEB3_URL } from "./../libs/config";
import { WalletService } from './wallet.service';
import {toHex, toWei, toBN} from 'web3-utils';
import Web3 from 'genaro-web3';
let web3: any = new Web3(WEB3_URL);

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private walletService: WalletService) { }

  async transfer(fromAddr: string, password: string, toAddr: string, amountInEther: string | number, gasLimit: number, gasPriceInGwei: string | number) {
    const gasInWei = toWei(toBN(gasPriceInGwei), 'gwei')
    const amountInWei = toWei(toBN(amountInEther), 'ether')
    const nonceval = await this.getNonce(fromAddr)
    let txOptions = {
      gasPrice: toHex(gasInWei),
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

  private sendTransaction(rawTx) {
    
    web3.eth.sendSignedTransaction(rawTx).once('transactionHash', function (hash) {
      console.log('1 hash get, transaction sent: ' + hash)
    }).on('error', function (error) {
        console.log('2 error: ' + error)
    }).then(async function (receipt) {
        // will be fired once the receipt its mined
        console.log('3 receipt mined, transaction success: ')
        console.log('receipt:\n' + JSON.stringify(receipt))
        //const txx = await web3.eth.getTransaction(receipt.transactionHash)
        //console.log('transaction:\n' + JSON.stringify(txx))
    })
  }

  async getBalance(address) {
    return await web3.eth.getBalance(address)
  }

  buyBucket() {

  }
}
