import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IpcService } from './ipc.service';
import { TOP_FARMER_URL, FARMER_URL, Role } from '../libs/config';
import { BrotherhoodService } from './brotherhood.service';
import { WalletService } from './wallet.service';

function add0x(addr: string) {
  if (addr && !addr.startsWith('0x')) { addr = '0x' + addr; }
  return addr || '';
}

@Injectable({
  providedIn: 'root'
})
export class CommitteeService {

  public currentSentinelRank: BehaviorSubject<[any]> = new BehaviorSubject(null);

  public currentMainWalletState: BehaviorSubject<any> = new BehaviorSubject(null);

  public pendingMainWalletState: BehaviorSubject<any> = new BehaviorSubject(null);

  private currentSentinelRanks: any = [];

  private pendingSentinelRanks: any = [];

  private currentSentinelRankDatas: any = [];

  private pendingSentinelRankDatas: any = [];

  async getSentinel() {
    let res = await fetch(TOP_FARMER_URL, {
      method: 'GET',
    });
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async getFarmer(addr) {
    let res = await fetch(FARMER_URL + add0x(addr).toLowerCase(), {
      method: 'GET',
    });
    try {
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async getCurrentFarmer(addr) {
    let data = await this.getFarmer(addr);
    if (data) {
      let state = await this.brotherhoodService.fetchState(data.address);
      if (state && state.pendingState) {
        data.subAccounts = state.pendingState.subAccounts;
      }
      data.order = this.currentSentinelRanks.indexOf(data.address);
    }
    return data;
  }

  async getCurrentCommittee() {
    const committees = await this.brotherhoodService.getCommitteeRank() || [];
    const arr = [];
    for (let i = 0, length = committees.length; i < length; i++) {
      // const sentinelDatas = await this.getFarmer(committees[i]);
      // const statesDatas = await this.brotherhoodService.fetchState(committees[i]);
      const data = {
        order: i,
        address: committees[i],
        nickName: '',
        subAccounts: []
      };
      // if (sentinelDatas && sentinelDatas.length > 0) {
      //   data.nickName = sentinelDatas[0].nickName;
      // }
      // if (statesDatas && statesDatas.currentState) {
      //   data.subAccounts = statesDatas.currentState.subAccounts;
      // }
      arr.push(data);
    }
    return arr;
  }

  async getCurrentSentinelRank() {
    const datas = await this.getSentinel();
    if (datas) {
      datas.forEach(async (d, i) => {
        const subFarmers = d.subFarmers || [],
              pendingSubFarmers = d.pendingSubFarmers || [];
        d.currentSentinel = d.sentinel || 0;
        d.currentStake = d.stake || 0;
        d.currentDataSize = d.data_size || 0;
        d.currentHeft = d.heft || 0;
        subFarmers.forEach(sf => {
          d.currentSentinel += sf.sentinel || 0;
          d.currentStake += sf.stake || 0;
          d.currentDataSize += sf.data_size || 0;
          d.currentHeft += sf.heft || 0;
        });
        d.pendingSentinel = d.sentinel || 0;
        d.pendingStake = d.stake || 0;
        d.pendingDataSize = d.data_size || 0;
        d.pendingHeft = d.heft || 0;
        pendingSubFarmers.forEach(psf => {
          d.pendingSentinel += psf.sentinel || 0;
          d.pendingStake += psf.stake || 0;
          d.pendingDataSize += psf.data_size || 0;
          d.pendingHeft += psf.heft || 0;
        });
      });
    }
    return datas;
  }

  getCurrentSentinelRankDatas() {
    return this.currentSentinelRankDatas;
  }

  getPendingSentinelRankDatas() {
    return this.pendingSentinelRankDatas;
  }

  private async initSentinelRank() {
    const datas = await this.getCurrentSentinelRank();
    this.currentSentinelRankDatas = datas.filter(f => !f.mainFarmer).sort((a, b) => {
      return b.currentSentinel - a.currentSentinel;
    });
    this.currentSentinelRanks = [];
    this.currentSentinelRankDatas.forEach((csrd, i) => {
      csrd.order = i;
      this.currentSentinelRanks.push(csrd.address);
    });
    this.pendingSentinelRankDatas = datas.filter(f => !f.pendingMainFarmer).sort((a, b) => {
      return b.pendingSentinel - a.pendingSentinel;
    });
    this.pendingSentinelRanks = [];
    this.pendingSentinelRankDatas.forEach((psrd, i) => {
      psrd.order = i;
      this.pendingSentinelRanks.push(psrd.address);
    });
    this.currentSentinelRank.next(this.currentSentinelRankDatas);
  }

  private async initCurrentWalletState() {
    const self = this;
    let broSub = null;
    let currentMainAddr = '',
      pendingMainAddr = '';
    this.walletService.currentWallet.subscribe(w => {
      if (broSub) {
        broSub.unsubscribe();
        currentMainAddr = '';
        pendingMainAddr = '';
      }
      const currentWalletAddr = add0x(self.walletService.wallets.current);
      self.brotherhoodService.addFetchingAddress(currentWalletAddr);
      broSub = self.brotherhoodService.stateUpdate.subscribe(async (states) => {
        if (states && states.length > 1 && states[1]) {
          if (states[0] === currentWalletAddr) {
            const currentState = states[1].currentState,
                  pendingState = states[1].pendingState;
            if (currentState && currentState.role === Role.Sub) {
              currentMainAddr = currentState.mainAccount;
              self.brotherhoodService.addFetchingAddress(currentMainAddr);
            } else {
              currentMainAddr = currentWalletAddr;
            }
            if (pendingState && pendingState.role === Role.Sub) {
              pendingMainAddr = pendingState.mainAccount;
              self.brotherhoodService.addFetchingAddress(pendingMainAddr);
            } else {
              pendingMainAddr = currentWalletAddr;
            }
          }

          if (states[0] === currentMainAddr) {
            let data;
            for (let i = 0, length = self.currentSentinelRankDatas.length; i < length; i++) {
              if (self.currentSentinelRankDatas[i].address === currentMainAddr) {
                data = self.currentSentinelRankDatas[i];
                break;
              }
            }
            if (!data) {
              data = await self.getFarmer(currentMainAddr) || {};
              data.address = currentMainAddr;
            }
            data.order = self.currentSentinelRanks.indexOf(currentMainAddr);
            data.currentAddress = currentWalletAddr;
            self.currentMainWalletState.next(data);
          }
          if (states[0] === pendingMainAddr) {
            let data;
            for (let i = 0, length = self.pendingSentinelRankDatas.length; i < length; i++) {
              if (self.pendingSentinelRankDatas[i].address === currentMainAddr) {
                data = self.pendingSentinelRankDatas[i];
                break;
              }
            }
            if (!data) {
              data = await self.getFarmer(pendingMainAddr) || {};
              data.address = pendingMainAddr;
            }
            data.order = self.pendingSentinelRanks.indexOf(pendingMainAddr);

            const subAccounts = data.pendingSubFarmers || [];
            for (let i = 0, length = subAccounts.length; i < length; i++) {
              if (subAccounts[i]) {
                if (states[0] === currentWalletAddr || subAccounts[i].address.toLowerCase() === currentWalletAddr) {
                  subAccounts[i].showRelieve = true;
                } else {
                  subAccounts[i].showRelieve = false;
                }
              }
            }

            if (pendingMainAddr === currentWalletAddr) {
              const tempSubAccountIds = (states[1].tempState || {}).subAccounts || [];
              const tempSubAccounts = [];
              for (let i = 0, length = tempSubAccountIds.length; i < length; i++) {
                if (tempSubAccountIds[i] && tempSubAccountIds[i].worker) {
                  const tsa = await self.getFarmer(tempSubAccountIds[i].worker.toLowerCase()) || {};
                  tsa.address = tempSubAccountIds[i].worker.toLowerCase();
                  tsa.flag = tempSubAccountIds[i].flag;
                  tempSubAccounts.push(tsa);
                }
              }
              data.tempAccounts = tempSubAccounts;
            }
            data.currentAddress = currentWalletAddr;
            self.pendingMainWalletState.next(data);
          }
        }
      });
    });
  }

  update(address, applyAddress) {
    this.ipc.dbRun('committee', `INSERT INTO committee (address, applyAddress) VALUES ('${address}', '${applyAddress}')`);
  }

  async get(address) {
    return await this.ipc.dbAll('committee', `SELECT * FROM committee WHERE address='${address}'`);
  }

  delete(address) {
    this.ipc.dbRun('committee', `DELETE FROM committee WHERE address='${address}'`);
  }

  constructor(
    private brotherhoodService: BrotherhoodService,
    private walletService: WalletService,
    private ipc: IpcService
  ) {
    this.initSentinelRank();
    setInterval(this.initSentinelRank.bind(this), 5 * 60 * 1000);
    this.initCurrentWalletState();
  }
}
