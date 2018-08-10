import { Injectable } from '@angular/core';
import { TransactionService } from './transaction.service';
import { BLOCK_COUNT_OF_ROUND, Role, RELATION_FETCH_INTERVAL, BROTHER_STATE_FILE, BROTHER_CONTRACT_ADDR } from '../libs/config';
import { BehaviorSubject } from 'rxjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { NzNotificationService } from 'ng-zorro-antd';

function add0x(addr: string) {
  if (!addr.startsWith('0x')) { addr = '0x' + addr; }
  return addr;
}

class BrotherContract {
  private abi = require('../libs/StakeLink.json').abi;
  private contract;
  constructor(private web3) {
    this.contract = new web3.eth.Contract(this.abi, BROTHER_CONTRACT_ADDR);
  }

  public getApplyInputData(address: string) {
    return this.contract.methods.link(address).encodeABI()
  }

  public getApproveInputData(address: string) {
    return this.contract.methods.agree(address).encodeABI()
  }

  public getTempMain(addr) {
    return new Promise((resolve, reject) => {
      this.contract.methods.bind(addr).call(function (err, res) {
        if (err) {
          reject(err)
          return
        }
        if (res === '0x0000000000000000000000000000000000000000') {
          res = '';
        }
        resolve(res);
      })
    })
  }

  public getTempSub(addr) {
    let self = this;
    function getSub(index) {
      return new Promise((resolve, reject) => {
        self.contract.methods.stakelink(addr, index).call(function (err, res) {
          if (err) {
            reject(err)
            return
          }
          resolve(res)
        })
      })
    }
    return new Promise((resolve, reject) => {
      this.contract.methods.totalworkers(addr).call(function (err, count) {
        if (err) {
          reject(err)
          return
        }
        count = parseInt(count)
        if (count && count > 0) {
          let subPromi = []
          for (let i = 1; i < count; i++) {
            subPromi.push(getSub(i))
          }
          Promise.all(subPromi).then(function (values) {
            resolve(values)
          });
        } else {
          resolve(null)
        }
      })
    })
  }
}

class LastStateStorage {
  private allState = {};
  constructor(
    private bs: BehaviorSubject<[string, any]>,
    private NotiService: NzNotificationService
  ) {
    this.ReadAll();
  }

  public SetAll(states) {
    const this2 = this;
    let sthChanged = false;
    states.forEach(state => {
      const addr = state.address;
      const oldVal = this2.allState[addr];
      const equals = this2.compareState(oldVal, state);
      if (!equals) {
        sthChanged = true;
        this2.allState[addr] = state;
        this2.bs.next([addr, state]);
      }
    });
    if (sthChanged) {
      this.SaveAll();
    }
  }

  private SaveAll() {
    writeFileSync(BROTHER_STATE_FILE, JSON.stringify(this.allState, null, 4));
  }

  public deleteEntry(addr) {
    delete this.allState[addr];
    this.SaveAll();
  }

  public addEntry(addr: string) {
    if (!this.allState[addr]) {
      this.allState[addr] = null;
    }
  }

  public getAllAddress(): Array<string> {
    return Object.keys(this.allState);
  }

  public getStateByAddress(addr) {
    return this.allState[addr];
  }

  private ReadAll() {
    if (existsSync(BROTHER_STATE_FILE)) {
      const content = readFileSync(BROTHER_STATE_FILE, { encoding: 'utf-8' });
      this.allState = JSON.parse(content);
    }
    for (const addr in this.allState) {
      this.bs.next([addr, this.allState[addr]]);
    }
  }

  // if equal return true, otherwise false
  private compareState(oldVal, newVal): boolean {
    // this.NotiService.info('haha', 'hahahahha');
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
    this.lastState = new LastStateStorage(this.stateUpdate, this.NotiService);
    this.alwaysFetch();
    // this.addFetchingAddress("0xe6be07488eddce660214cf5e1a4058766df1cee7");
  }

  private async alwaysFetch() {
    const promises = this.lastState.getAllAddress().map(this.fetchState.bind(this));
    const states = await Promise.all(promises);
    this.lastState.SetAll(states);
    setTimeout(this.alwaysFetch.bind(this), RELATION_FETCH_INTERVAL);
  }

  public addFetchingAddress(address: string) {
    this.lastState.addEntry(address);
  }

  public deleteFetchingAddress(address: string) {
    this.lastState.deleteEntry(address);
  }

  public getStateByAddress(address: string) {
    address = add0x(address);
    return [address, this.lastState.getStateByAddress(address)];
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

  async applyBrotherhood(mainAddress: string, address: string, password: string, gasLimit: number, gasPriceInGwei: string | number) {
    const web3 = await this.TxService.getWeb3Instance();
    const contract = new BrotherContract(web3)
    const inputData = contract.getApplyInputData(mainAddress)
    return await this.TxService.sendContractTransaction(address, password, BROTHER_CONTRACT_ADDR, inputData, 'APPLY_BROTHER', gasLimit, gasPriceInGwei)
  }

  async approveBrotherhood(subAddress: string, address: string, password: string, gasLimit: number, gasPriceInGwei: string | number) {
    const web3 = await this.TxService.getWeb3Instance();
    const contract = new BrotherContract(web3)
    const inputData = contract.getApproveInputData(subAddress)
    return await this.TxService.sendContractTransaction(address, password, BROTHER_CONTRACT_ADDR, inputData, 'APPROVE_BROTHER', gasLimit, gasPriceInGwei)
  }

  async getTempMainAccount(address: string) {
    const web3 = await this.TxService.getWeb3Instance();
    const contract = new BrotherContract(web3)
    return await contract.getTempMain(address)
  }

  async getTempSubAccounts(address: string) {
    const web3 = await this.TxService.getWeb3Instance();
    const contract = new BrotherContract(web3)
    return await contract.getTempSub(address)
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

  // private async getCurrentMainAccount(address: string) {
  //   const extra = await this.getCurrentRoundExtra();
  //   if (extra && extra.CommitteeAccountBinding) {
  //     const binding = extra.CommitteeAccountBinding;
  //     for (const mainAccount in binding) {
  //       if (Array.isArray(binding[mainAccount]) && binding[mainAccount].includes(add0x(address))) {
  //         return mainAccount;
  //       }
  //     }
  //   }
  //   return null;
  // }

  // private async getCurrentSubAccounts(address: string) {
  //   const extra = await this.getCurrentRoundExtra();
  //   if (extra && extra.CommitteeAccountBinding) {
  //     return extra.CommitteeAccountBinding[add0x(address)];
  //   } else {
  //     return null;
  //   }
  // }

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

  private getTempRole(state) {
    if (state.mainAccount) {
      return Role.Sub;
    }
    let hasAgreed = false;
    if (state.subAccounts && state.subAccounts.length > 0) {
      state.subAccounts.forEach(sa => {
        if (sa.flag) {
          hasAgreed = true;
        }
      });
      if (hasAgreed) {
        return Role.Main;
      }
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
      mainAccount: await this.getPendingMainAccount(address),
      subAccounts: await this.getPendingSubAccounts(address),
      role: null,
    };
    state['role'] = this.getRole(state);
    return state;
  }

  private async fetchTempState(address: string) {
    const state = {
      mainAccount: await this.getTempMainAccount(address),
      subAccounts: await this.getTempSubAccounts(address),
      role: null,
    };
    state['role'] = this.getTempRole(state);
    return state;
  }

  async fetchState(address: string) {
    const [currentState, pendingState, tempState] = await Promise.all([this.fetchCurrentState(address), this.fetchPendingState(address), this.fetchTempState(address)]);
    return {
      address,
      currentState,
      pendingState,
      tempState
    };
  }

}
