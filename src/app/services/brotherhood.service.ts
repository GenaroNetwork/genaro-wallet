import { Injectable } from '@angular/core';
import { TransactionService } from './transaction.service';
import { BLOCK_COUNT_OF_ROUND, Role, RELATION_FETCH_INTERVAL, BROTHER_STATE_FILE } from '../libs/config';
import { BehaviorSubject } from 'rxjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { NzNotificationService } from 'ng-zorro-antd';

function add0x(addr: string) {
  if (!addr.startsWith('0x')) { addr = '0x' + addr; }
  return addr;
}

class LastStateStorage {
  private allState = {};
  constructor(
    private bs: BehaviorSubject<[string, any]>, 
    private NotiService: NzNotificationService
  ) {
    this.ReadAll()
  }

  public SetAll(states) {
    const this2 = this
    let sthChanged = false
    states.forEach(state => {
      const addr = state.address
      const oldVal = this2.allState[addr];
      const equals = this2.compareState(oldVal, state);
      if (!equals) {
        sthChanged = true
        this2.allState[addr] = state
        this2.bs.next([addr, state]);
      }
    });
    if(sthChanged) {
      this.SaveAll();
    }
  }

  private SaveAll() {
    writeFileSync(BROTHER_STATE_FILE, JSON.stringify(this.allState))
  }

  public deleteEntry(addr) {
    delete this.allState[addr]
    this.SaveAll()
  }

  public addEntry(addr: string) {
    if(!this.allState[addr]) {
      this.allState[addr] = null
    }
  }

  public getAllAddress(): Array<string> {
    return Object.keys(this.allState)
  }

  private ReadAll() {
    if(existsSync(BROTHER_STATE_FILE)) {
      const content = readFileSync(BROTHER_STATE_FILE, { encoding: 'utf-8' })
      this.allState = JSON.parse(content)
    }
    for (const addr in this.allState) {
      this.bs.next([addr, this.allState[addr]])
    }
  }

  // if equal return true, otherwise false
  private compareState(oldVal, newVal): boolean {
    this.NotiService.info("haha", "hahahahha")
    // TODO: compare new value with old value. Send notification if necessary
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class BrotherhoodService {

  private lastState: LastStateStorage;
  public stateUpdate: BehaviorSubject<[string, any]> = new BehaviorSubject(null);

  constructor(
    private TxService: TransactionService,
    private NotiService: NzNotificationService
  ) {
    this.alwaysFetch();
    this.lastState = new LastStateStorage(this.stateUpdate, this.NotiService)
  }

  private async alwaysFetch() {
    const promises = this.lastState.getAllAddress().map(this.fetchState);
    const states = await Promise.all(promises);
    this.lastState.SetAll(states)
    setTimeout(this.alwaysFetch.bind(this), RELATION_FETCH_INTERVAL);
  }
  
  public addFetchingAddress(address: string) {
    this.lastState.addEntry(address)
  }

  public deleteFetchingAddress(address: string) {
    this.lastState.deleteEntry(address)
  }
  /*
    there are 3 phases to make brotherhood relation really take effect:
    1. relation saved to temp table which is a smart contract.
    2. relation saved to pending table by official account through some special transaction.
    3. relation takes effect when next round commitee begins

    user can only make changes to temp table directly only
  */

  private async getCurrentRoundExtra() {
    const web3 = await this.TxService.getWeb3Instance();
    // @ts-ignore
    const bno = await web3.eth.getBlockNumber();
    const thisRoundFirstBlock = bno - bno % BLOCK_COUNT_OF_ROUND;
    // @ts-ignore
    const extraInfo = await web3.genaro.getExtra(thisRoundFirstBlock);
    return extraInfo;
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

  private async getPendingMainAccount(address: string) {
    const web3 = await this.TxService.getWeb3Instance();
    // @ts-ignore
    return await web3.genaro.getMainAccount(address, 'latest');
  }

  private async getPendingSubAccounts(address: string) {
    const web3 = await this.TxService.getWeb3Instance();
    // @ts-ignore
    return await web3.genaro.getSubAccounts(address, 'latest');
  }

  private async getCurrentMainAccount(address: string) {
    const extra = await this.getCurrentRoundExtra();
    if (extra && extra.CommitteeAccountBinding) {
      const binding = extra.CommitteeAccountBinding;
      for (const mainAccount in binding) {
        if (Array.isArray(binding[mainAccount]) && binding[mainAccount].includes(add0x(address))) {
          return mainAccount;
        }
      }
    }
    return null;
  }

  private async getCurrentSubAccounts(address: string) {
    const extra = await this.getCurrentRoundExtra();
    if (extra && extra.CommitteeAccountBinding) {
      return extra.CommitteeAccountBinding[add0x(address)];
    } else {
      return null;
    }
  }

  async getCommitteeRank() {
    const web3 = await this.TxService.getWeb3Instance();
    // @ts-ignore
    return await web3.genaro.getCommitteeRank('latest');
  }

  private getRole(state) {
    if (state.mainAccount) {
      return Role.Sub;
    }
    if (state.subAccounts && state.subAccounts.length > 0) {
      return Role.Main;
    }
    return Role.Free;
  }

  private async fetchCurrentState(address: string) {
    function getSubs(extra) {
      if (extra && extra.CommitteeAccountBinding) {
        return extra.CommitteeAccountBinding[add0x(address)];
      }
      return null;
    }
    function getMain(extra) {
      if (extra && extra.CommitteeAccountBinding) {
        const binding = extra.CommitteeAccountBinding;
        for (const mainAccount in binding) {
          if (Array.isArray(binding[mainAccount]) && binding[mainAccount].includes(add0x(address))) {
            return mainAccount;
          }
        }
      }
      return null;
    }
    // get current state
    const extra = await this.getCurrentRoundExtra();
    const state = {
      mainAccount: getMain(extra),
      subAccounts: getSubs(extra)
    };
    state['role'] = this.getRole(state);
    return state;
  }

  private async fetchPendingState(address: string) {
    const state = {
      mainAccount: this.getPendingMainAccount(address),
      subAccounts: this.getPendingSubAccounts(address)
    };
    state['role'] = this.getRole(state);
    return state;
  }

  private async fetchTempState(address: string) {
    const state = {
      mainAccount: this.getTempMainAccount(address),
      subAccounts: this.getTempSubAccounts(address)
    };
    state['role'] = this.getRole(state);
    return state;
  }

  private async fetchState(address: string) {
    const [currentState, pendingState, tempState] = await Promise.all([this.fetchCurrentState(address), this.fetchPendingState(address), this.fetchTempState(address)]);
    return {
      address,
      currentState,
      pendingState,
      tempState
    };
  }

}
