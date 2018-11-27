import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IpcService } from './ipc.service';
import { TOP_FARMER_URL, FARMER_URL, Role, RELATION_FETCH_INTERVAL } from '../libs/config';
import { BrotherhoodService } from './brotherhood.service';
import { WalletService } from './wallet.service';

function add0x(addr: string) {
  if (addr && !addr.startsWith('0x')) return addr = '0x' + addr;
  return addr;
}

@Injectable({
  providedIn: 'root'
})
export class CommitteeService {

  public currentSentinelRank: any[] = [];

  public pendingSentinelRank: any[] = [];

  public currentMainWalletState: any = {};

  public pendingMainWalletState: any = {};

  private allDatas: any = [];

  private currentSentinelRanks: any = [];

  private pendingSentinelRanks: any = [];

  private currentSentinelRankDatas: any = [];

  private pendingSentinelRankDatas: any = [];

  private walletSub: any;

  public activeJoinBtn: BehaviorSubject<any> = new BehaviorSubject(null);

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
    let data;
    for (let i = 0, length = this.allDatas.length; i < length; i++) {
      if (addr === this.allDatas[i].address) {
        data = this.allDatas[i];
        data.order = data.order || -1;
        data.pendingOrder = data.pendingOrder || -1;
        break;
      }
    }
    if (!data) {
      data = await this.getFarmer(addr);
      if (data) {
        data.currentSentinel = data.sentinel || 0;
        data.currentStake = data.stake || 0;
        data.currentDataSize = data.data_size || 0;
        data.currentHeft = data.heft || 0;
        data.pendingSentinel = data.sentinel || 0;
        data.pendingStake = data.stake || 0;
        data.pendingDataSize = data.data_size || 0;
        data.pendingHeft = data.heft || 0;
        let state = await this.brotherhoodService.fetchState(data.address);
        let orderAddr = data.address;
        if (state) {
          if (state.pendingState) {
            data.pendingSubFarmers = state.pendingState.subAccounts;
          }
          if (state.currentState) {
            data.subFarmers = state.currentState.subAccounts;
            orderAddr = state.currentState.mainAccount || orderAddr;
          }
        }
        data.order = this.currentSentinelRanks.indexOf(orderAddr);
        data.pendingOrder = this.pendingSentinelRanks.indexOf(orderAddr);
      }
    }
    this.currentSentinelRank = data || [];
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
    this.allDatas = datas;
    this.currentSentinelRankDatas = datas.filter(f => !f.mainFarmer).sort((a, b) => {
      if (a.currentSentinel || b.currentSentinel) {
        return b.currentSentinel - a.currentSentinel;
      }
      else {
        return b.currentStake - a.currentStake;
      }

    });
    this.currentSentinelRanks = [];
    this.currentSentinelRankDatas.forEach((csrd, i) => {
      csrd.order = i;
      this.currentSentinelRanks.push(csrd.address);
    });
    this.pendingSentinelRankDatas = datas.filter(f => !f.pendingMainFarmer).sort((a, b) => {
      if (a.pendingSentinel || b.pendingSentinel) {
        return b.pendingSentinel - a.pendingSentinel;
      }
      else {
        return b.pendingStake - a.pendingStake;
      }
    });
    this.pendingSentinelRanks = [];
    this.pendingSentinelRankDatas.forEach((psrd, i) => {
      psrd.pendingOrder = i;
      this.pendingSentinelRanks.push(psrd.address);
    });
    this.zone.run(() => {
      this.currentSentinelRank = this.currentSentinelRankDatas;
      this.pendingSentinelRank = this.pendingSentinelRankDatas;
    });
    this.initCurrentWalletState();
  }

  private async initCurrentWalletState() {
    const self = this;
    let currentMainAddr = '',
      pendingMainAddr = '';
    if (this.walletSub) {
      this.walletSub.unsubscribe();
    }
    this.walletSub = this.walletService.currentWallet.subscribe(async wallet => {
      currentMainAddr = '';
      pendingMainAddr = '';
      const currentWalletAddr = add0x(wallet.address);
      if (this.allDatas) {
        for (let i = 0, length = this.allDatas.length; i < length; i++) {
          if (currentWalletAddr === this.allDatas[i].address) {
            currentMainAddr = this.allDatas[i].mainFarmer || currentWalletAddr;
            pendingMainAddr = this.allDatas[i].pendingMainFarmer || currentWalletAddr;
            break;
          }
        }

        currentMainAddr = currentMainAddr || currentWalletAddr;
        pendingMainAddr = pendingMainAddr || currentWalletAddr;

        let mainData;
        for (let i = 0, length = self.currentSentinelRankDatas.length; i < length; i++) {
          if (self.currentSentinelRankDatas[i].address === currentMainAddr) {
            mainData = self.currentSentinelRankDatas[i];
            break;
          }
        }
        if (!mainData) {
          mainData = await self.getFarmer(currentMainAddr) || {};
          mainData.address = currentMainAddr;
        }
        mainData.order = self.currentSentinelRanks.indexOf(currentMainAddr);
        mainData.currentAddress = currentWalletAddr;
        mainData.shortAddr = mainData.address.slice(0, 6);
        this.zone.run(() => {
          self.currentMainWalletState = mainData;
        });

        let pendingData;
        for (let i = 0, length = self.pendingSentinelRankDatas.length; i < length; i++) {
          if (self.pendingSentinelRankDatas[i].address === pendingMainAddr) {
            pendingData = self.pendingSentinelRankDatas[i];
            break;
          }
        }
        if (!pendingData) {
          pendingData = await self.getFarmer(pendingMainAddr) || {};
          pendingData.address = pendingMainAddr;
        }
        pendingData.pendingOrder = self.pendingSentinelRanks.indexOf(pendingMainAddr);

        const subAccounts = pendingData.pendingSubFarmers || [];
        for (let i = 0, length = subAccounts.length; i < length; i++) {
          if (subAccounts[i]) {
            if (pendingMainAddr === currentWalletAddr || subAccounts[i].address.toLowerCase() === currentWalletAddr) {
              subAccounts[i].showRelieve = true;
            } else {
              subAccounts[i].showRelieve = false;
            }
          }
        }
        if (pendingMainAddr === currentWalletAddr) {
          let state = await self.brotherhoodService.fetchState2(currentWalletAddr);
          if (state && state.tempState) {
            const tempSubAccountIds = state.tempState.subAccounts || [];
            const tempSubAccounts = [];
            // @ts-ignore
            for (let i = 0, length = tempSubAccountIds.length; i < length; i++) {
              if (tempSubAccountIds[i] && tempSubAccountIds[i].worker) {
                const tsa = await self.getFarmer(tempSubAccountIds[i].worker.toLowerCase()) || {};
                tsa.address = tempSubAccountIds[i].worker.toLowerCase();
                tsa.flag = tempSubAccountIds[i].flag;
                tempSubAccounts.push(tsa);
              }
            }
            pendingData.tempAccounts = tempSubAccounts;
          }
        }
        else {
          pendingData.tempAccounts = [];
        }
        pendingData.currentAddress = currentWalletAddr;
        this.zone.run(() => {
          pendingData.shortAddr = pendingData.address.slice(0, 6);
          this.pendingMainWalletState = pendingData;
        });
      }
    });
  }

  update(address, applyAddress) {
    this.ipc.dbRun('committee', `INSERT INTO committee (address, applyAddress) VALUES ('${address}', '${applyAddress}')`);
    this.activeJoinBtn.next('update');
  }

  async get(address) {
    return await this.ipc.dbAll('committee', `SELECT * FROM committee WHERE address='${address}'`);
  }

  delete(address) {
    this.ipc.dbRun('committee', `DELETE FROM committee WHERE address='${address}'`);
    this.activeJoinBtn.next('delete');
  }

  refreshSentinelRank() {
    this.initSentinelRank();
  }

  constructor(
    private brotherhoodService: BrotherhoodService,
    private walletService: WalletService,
    private ipc: IpcService,
    private zone: NgZone,
  ) {
    this.initSentinelRank();
    // setInterval(this.initSentinelRank.bind(this), RELATION_FETCH_INTERVAL);
  }
}
