import { Component, OnInit, Input, OnDestroy, HostListener, ElementRef, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { CommitteeService } from '../../services/committee.service';
import { BrotherhoodService } from '../../services/brotherhood.service';
import { Role } from '../../libs/config';

function add0x(addr: string) {
  if (!addr.startsWith('0x')) { addr = '0x' + addr; }
  return addr;
}

@Component({
  selector: 'app-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent implements OnInit, OnDestroy, OnChanges {

  @Input('name') name: string;
  @Input('opt') opt: any;
  @Output('action') action: EventEmitter<any> = new EventEmitter;

  @HostListener('window:resize', ['$event'])
  onResize(event) {

  }

  accountTeamInfo: any = {};
  showCurrentTeam = false;
  currentSubscribe: any;
  async rankInit() {
    let currentAddr = add0x(this.walletService.wallets.current);
    this.brotherhoodService.addFetchingAddress(currentAddr);
    let self = this;
    let firstIn = true;
    this.currentSubscribe = this.brotherhoodService.stateUpdate.subscribe(async states => {
      if(firstIn) {
        // @ts-ignore
        states = self.brotherhoodService.getStateByAddress(currentAddr);
      }
      firstIn = false;
      if(states) {
        if(currentAddr === states[0]) {
          let currentState = states[1].currentState;
          if(currentState.role === Role.Sub) {
            self.accountTeamInfo.address = currentState.mainAccount;
            self.brotherhoodService.addFetchingAddress(currentState.mainAccount);
          }
          else {
            self.accountTeamInfo.address = currentAddr;
          }
        }

        if(self.accountTeamInfo.address === states[0]) {
          let currentState = states[1].currentState;
          let currentSentinel = await self.committeeService.getSentinel(states[0]);
          if(currentSentinel.length > 0) {
            self.accountTeamInfo.nickName = currentSentinel[0].nickName;
            self.accountTeamInfo.order = currentSentinel[0].order || -1;
            self.accountTeamInfo.stake = currentSentinel[0].stake || 0;
            self.accountTeamInfo.data_size = currentSentinel[0].data_size || 0;
            self.accountTeamInfo.sentinel = currentSentinel[0].sentinel || 0;
          }
          let subs = currentState.subAccounts || [];
          let subAccounts = [];
          for(let i = 0, length = subs.length; i < length; i++) {
            let subAccount = await this.committeeService.getSentinel(subs[i]);
            if (subAccount.length > 0) {
              subAccounts.push(subAccount[0]);
            }
          }
          self.accountTeamInfo.subAccounts = subAccounts;
        }
      }
    });
  }
  rankDestroy() {
    let currentAddr = this.walletService.wallets.current;
    this.brotherhoodService.deleteFetchingAddress(currentAddr);
    this.currentSubscribe.unsubscribe();
  }


  paddingTeamInfo: any = {};
  showPaddingTeam = false;
  showApplyTeam = false;
  paddingSubscribe: any;
  async committeeInit() {
    let currentAddr = add0x(this.walletService.wallets.current);
    this.brotherhoodService.addFetchingAddress(currentAddr);
    let self = this;
    let firstIn = true;
    this.paddingSubscribe = this.brotherhoodService.stateUpdate.subscribe(async states => {
      if(firstIn) {
        // @ts-ignore
        states = self.brotherhoodService.getStateByAddress(currentAddr);
      }
      firstIn = false;
      if(states) {
        if(currentAddr === states[0]) {
          let pendingState = states[1].pendingState;
          if(pendingState.role === Role.Sub) {
            self.paddingTeamInfo.address = pendingState.mainAccount;
            this.brotherhoodService.addFetchingAddress(pendingState.mainAccount);
          }
          else {
            self.paddingTeamInfo.address = currentAddr;
          }
        }

        if(self.paddingTeamInfo.address === states[0]) {
          let pendingState = states[1].pendingState;
          let pendingSentinel = await self.committeeService.getSentinel(states[0]);
          if(pendingSentinel.length > 0) {
            self.paddingTeamInfo.nickName = pendingSentinel[0].nickName;
            self.paddingTeamInfo.order = pendingSentinel[0].order || -1;
            self.paddingTeamInfo.stake = pendingSentinel[0].stake || 0;
            self.paddingTeamInfo.data_size = pendingSentinel[0].data_size || 0;
            self.paddingTeamInfo.sentinel = pendingSentinel[0].sentinel || 0;
          }
          let subs = pendingState.subAccounts || [];
          let subAccounts = [];
          for(let i = 0, length = subs.length; i < length; i++) {
            let subAccount = await this.committeeService.getSentinel(subs[i]);
            if(subAccount) {
              subAccounts.push(subAccount);
            }
          }
          self.paddingTeamInfo.subAccounts = subAccounts;

          let tempState = states[1].tempState;
          let tempSubs = tempState.subAccounts || [];
          let tempAccounts = [];
          for(let i = 0, length = tempSubs.length; i < length; i++) {
            let subAccount = await this.committeeService.getSentinel(tempSubs[i].worker);
            if(subAccount.length > 0) {
              subAccount[0].flag = tempSubs[i].flag;
              tempAccounts.push(subAccount[0]);
            }
          }
          self.paddingTeamInfo.tempAccounts = tempAccounts;
        }
      }
    });
  }
  committeeDestroy() {
    let currentAddr = this.walletService.wallets.current;
    this.brotherhoodService.deleteFetchingAddress(currentAddr);
    this.paddingSubscribe.unsubscribe();
  }


  constructor(
    public walletService: WalletService,
    public committeeService: CommitteeService,
    public brotherhoodService: BrotherhoodService
  ) { }

  ngOnInit() {
    if (this[`${this.name}Init`]) {
      this[`${this.name}Init`]();
    }
  }

  ngOnChanges(changes: { [prop: string]: SimpleChange }) {
    if (changes.change) {
      if (this[`${name}Change`]) { this[`${name}Change`](); }
    }
  }

  ngOnDestroy() {
    if (this[`${this.name}Destroy`]) {
      this[`${this.name}Destroy`]();
    }
  }
}
