import { Injectable } from '@angular/core';
import { TransactionService } from './transaction.service'
import { BLOCK_COUNT_OF_ROUND, Role } from "../libs/config";

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

  private defineRole(state) {
    Object.defineProperty(state, 'role', { get: function() {
      if(this.mainAccount) {
        return Role.Sub
      }
      if(this.subAccounts && this.subAccounts.length > 0) {
        return Role.Main
      }
      return Role.Free
    } });
  }

  private async fetchCurrentState(address: string) {
    function getSubs(extra) {
      if(extra && extra.CommitteeAccountBinding) {
        return extra.CommitteeAccountBinding[add0x(address)]
      }
      return null
    }
    function getMain(extra) {
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
    // get current state
    const extra = await this.getCurrentRoundExtra()
    const state = {
      mainAccount: getMain(extra),
      subAccounts: getSubs(extra)
    }
    this.defineRole(state)
    return state
  }

  private async fetchPendingState(address: string) {
    const state = {
      mainAccount: this.getCurrentMainAccount(address),
      subAccounts: this.getCurrentSubAccounts(address)
    }
    this.defineRole(state)
    return state
  }

  private async fetchTempState(address: string) {
    const state = {
      mainAccount: this.getTempMainAccount(address),
      subAccounts: this.getTempSubAccounts(address)
    }
    this.defineRole(state)
    return state
  }

  async fetchState(address: string) {
    return {
      currentState: await this.fetchCurrentState(address),
      pendingState: await this.fetchPendingState(address),
      tempState:    await this.fetchTempState(address)
    }
  }
}
