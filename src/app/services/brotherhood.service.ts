import { Injectable } from '@angular/core';
import { TransactionService } from './transaction.service'
import { BLOCK_COUNT_OF_ROUND } from "../libs/config";

function add0x(addr: string) {
  if (!addr.startsWith("0x")) addr = "0x" + addr;
  return addr
}

@Injectable({
  providedIn: 'root'
})
export class BrotherhoodService {

constructor(
  private TxService: TransactionService
) { }

/*
  there are 3 phases to make brotherhood relation really take effect:
  1. relation saved to temp table which is a smart contract.
  2. relation saved to pending table by official account through some special transaction.
  3. relation takes effect when next round commitee begins

  user can only make changes to temp table directly only
*/

// read relation


  // brotherhood
  private async getCurrentRoundExtra() {
    const web3 = await this.TxService.getWeb3Instance()
    // @ts-ignore
    const bno = await web3.eth.getBlockNumber()
    const thisRoundFirstBlock = bno - bno % BLOCK_COUNT_OF_ROUND
    // @ts-ignore
    const extraInfo = await web3.genaro.getExtra(thisRoundFirstBlock)
    return extraInfo
  }

  async applyBrotherhood(mainAddress: string) {

  }

  async approveBrotherhood() {

  }

  async unbindBrotherhood() {

  }

  async getTempMainAccount(address: string) {
  }

  async getTempSubAccounts(address: string) {
  }

  async getPendingMainAccount(address: string) {
    const web3 = await this.TxService.getWeb3Instance()
    // @ts-ignore
    return await web3.genaro.getMainAccount(address, 'latest');
  }

  async getPendingSubAccounts(address: string) {
    const web3 = await this.TxService.getWeb3Instance()
    // @ts-ignore
    return await web3.genaro.getSubAccounts(address, 'latest');
  }

  async getCurrentMainAccount(address: string) {
    const extra = await this.getCurrentRoundExtra()
    if(extra && extra.CommitteeAccountBinding) {
      const binding = extra.CommitteeAccountBinding
      for (let mainAccount in binding) {
        if (Array.isArray(binding[mainAccount]) && binding[mainAccount].includes(add0x(address))) {
          return mainAccount
        }
      }
    }
    return null
  }

  async getCurrentSubAccounts(address: string) {
    const extra = await this.getCurrentRoundExtra()
    if(extra && extra.CommitteeAccountBinding) {
      return extra.CommitteeAccountBinding[add0x(address)]
    } else {
      return null
    }
  }

  async getCommitteeRank() {
    const web3 = await this.TxService.getWeb3Instance()
    // @ts-ignore
    return await web3.genaro.getCommitteeRank('latest');
  }
}
