import { Injectable } from '@angular/core';
import { TransactionService } from './transaction.service'
import { BLOCK_COUNT_OF_ROUND, Role, RELATION_FETCH_INTERVAL } from "../libs/config";
import { BehaviorSubject } from 'rxjs';

function add0x(addr: string) {
  if (!addr.startsWith("0x")) addr = "0x" + addr;
  return addr
}

@Injectable({
  providedIn: 'root'
})
export class BrotherhoodService {

  private lastState: Map<string, any> = new Map();
  public stateUpdate: BehaviorSubject<Map<string, any>> = new BehaviorSubject(null);
  private fetchingAddress: Array<string>;

  constructor(
    private TxService: TransactionService
  ) { 
    this.fetchingAddress = []
    this.alwaysFetch()
  }

  private async alwaysFetch() {
    const this2 = this
    const promises = this.fetchingAddress.map(this.fetchState)
    const states = await Promise.all(promises)
    let somethingChanged = false;
    states.forEach(state => {
      // @ts-ignore
      const oldVal = this2.lastState.get(state.address)
      const equals = this2.compareState(oldVal, state)
      if(!equals) {
        somethingChanged = true;
        this2.lastState.set(state.address, state)
      }
    })
    // update value
    if(somethingChanged) {
      this.stateUpdate.next(this.lastState)
    }
    setTimeout(this.alwaysFetch, RELATION_FETCH_INTERVAL)
  }

  // if equal return true, otherwise false
  // send 
  private compareState(oldVal, newVal): boolean {
    //TODO: compare new value with old value. Send notification if necessary
    return false
  }
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

  private getRole(state) {
    if(state.mainAccount) {
      return Role.Sub
    }
    if(state.subAccounts && state.subAccounts.length > 0) {
      return Role.Main
    }
    return Role.Free
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
    state['role'] = this.getRole(state)
    return state
  }

  private async fetchPendingState(address: string) {
    const state = {
      mainAccount: this.getCurrentMainAccount(address),
      subAccounts: this.getCurrentSubAccounts(address)
    }
    state['role'] = this.getRole(state)
    return state
  }

  private async fetchTempState(address: string) {
    const state = {
      mainAccount: this.getTempMainAccount(address),
      subAccounts: this.getTempSubAccounts(address)
    }
    state['role'] = this.getRole(state)
    return state
  }

  private async fetchState(address: string) {
    let [currentState, pendingState, tempState] = await Promise.all([this.fetchCurrentState(address), this.fetchPendingState(address), this.fetchTempState(address)])
    return {
      address,
      currentState,
      pendingState,
      tempState
    }
  }

}
