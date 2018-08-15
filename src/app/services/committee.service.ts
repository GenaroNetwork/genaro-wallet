import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IpcService } from './ipc.service';
import { TOP_FARMER_URL, FARMER_URL, Role } from '../libs/config';
import { BrotherhoodService } from './brotherhood.service';
import { WalletService } from './wallet.service';
const axios = require('axios');

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

  public paddingMainWalletState: BehaviorSubject<any> = new BehaviorSubject(null);

  private currentSentinelRanks: any = [];

  private currentSentinelRankDatas: any = [];

  async getSentinel() {
    const res = await axios({
      method: 'GET',
      url: TOP_FARMER_URL
    });
    return res.data;
  }

  async getFarmer(addr) {
    const res = await axios({
      method: 'GET',
      url: FARMER_URL + add0x(addr).toLowerCase()
    });
    return res.data;
  }

  async getCurrentFarmer(addr) {
    let data = await this.getFarmer(addr);
    if(data) {
      let state = await this.brotherhoodService.fetchState(data.address);
      if(state.pendingState) {
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
      const sentinelDatas = await this.getFarmer(committees[i]);
      const statesDatas = await this.brotherhoodService.fetchState(committees[i]);
      const data = {
        order: i,
        address: committees[i],
        nickName: '',
        subAccounts: []
      };
      if (sentinelDatas.length > 0) {
        data.nickName = sentinelDatas[0].nickName;
      }
      if (statesDatas.currentState) {
        data.subAccounts = statesDatas.currentState.subAccounts;
      }
      arr.push(data);
    }
    return arr;
  }

  async getCurrentSentinelRank() {
    this.currentSentinelRanks = [];
    const datas = await this.getSentinel();
    if (datas) {
      let fetchStates = [];
      datas.forEach(async (d, i) => {
        d.order = i;
        this.currentSentinelRanks.push(d.address);
        fetchStates.push(this.brotherhoodService.fetchState(d.address));
      });
      let states = await Promise.all(fetchStates);
      for(let i = 0, length = datas.length; i< length; i++) {
        let state = states[i];
        let d = datas[i];
        if(state.pendingState) {
          d.subAccounts = state.pendingState.subAccounts;
        }
        if(state.currentState) {
          d.currentSubAccounts = state.currentState.subAccounts;
        }
      }
    }
    return datas;
  }

  getCurrentSentinelRankDatas() {
    return this.currentSentinelRankDatas;
  }

  private async initCurrentSentinelRank() {
    this.currentSentinelRankDatas = await this.getCurrentSentinelRank();
    this.currentSentinelRank.next(this.currentSentinelRankDatas);
  }

  private async initCurrentWalletState() {
    let self = this;
    let broSub = null;
    let currentMainAddr = '',
        pendingMainAddr = '';
    this.walletService.currentWallet.subscribe(w => {
      if(broSub) {
        broSub.unsubscribe();
        currentMainAddr = '';
        pendingMainAddr = '';
      }
      let currentWalletAddr = add0x(self.walletService.wallets.current);
      self.brotherhoodService.addFetchingAddress(currentWalletAddr);
      broSub = self.brotherhoodService.stateUpdate.subscribe(async (states) => {
        if (states && states.length > 1 && states[1]) {
          if (states[0] === currentWalletAddr) {
            let currentState = states[1].currentState,
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

          if(states[0] === currentMainAddr) {
            let data = await self.getFarmer(currentMainAddr) || {};
            data.address = currentMainAddr;
            data.order = self.currentSentinelRanks.indexOf(currentMainAddr);
            let subAccountIds = (states[1].currentState || {}).subAccounts || [];
            let subAccounts = [];
            for(let i = 0, length = subAccountIds.length; i < length; i++) {
              if(subAccountIds[i]) {
                subAccounts.push(await self.getFarmer(subAccountIds[i].toLowerCase()));
              }
            }
            data.subAccounts = subAccounts;
            self.currentMainWalletState.next(data);
          }
          if(states[0] === pendingMainAddr) {
            let data = await self.getFarmer(pendingMainAddr) || {};
            data.address = pendingMainAddr;
            data.order = self.currentSentinelRanks.indexOf(pendingMainAddr);
            let subAccountIds = (states[1].pendingState || {}).subAccounts || [];
            let subAccounts = [];
            for(let i = 0, length = subAccountIds.length; i < length; i++) {
              if(subAccountIds[i]) {
                let sa = await self.getFarmer(subAccountIds[i].toLowerCase()) || {};
                sa.address = subAccountIds[i].toLowerCase();
                if(states[0] === currentWalletAddr || sa.address === currentWalletAddr) {
                  sa.showRelieve = true;
                }
                else {
                  sa.showRelieve = false;
                }
                subAccounts.push(sa);
              }
            }
            data.subAccounts = subAccounts;
            if(pendingMainAddr === currentWalletAddr) {
              let tempSubAccountIds = (states[1].tempState || {}).subAccounts || [];
              let tempSubAccounts = [];
              for(let i = 0, length = tempSubAccountIds.length; i < length; i++) {
                if(tempSubAccountIds[i] && tempSubAccountIds[i].worker) {
                  let tsa = await self.getFarmer(tempSubAccountIds[i].worker.toLowerCase()) || {};
                  tsa.address = tempSubAccountIds[i].worker.toLowerCase();
                  tsa.flag = tempSubAccountIds[i].flag;
                  tempSubAccounts.push(tsa);
                }
              }
              data.tempAccounts = tempSubAccounts;
            }
            self.paddingMainWalletState.next(data);
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
    this.initCurrentSentinelRank();
    setInterval(this.initCurrentSentinelRank.bind(this), 5 * 60 * 1000);
    this.initCurrentWalletState();
  }
}
