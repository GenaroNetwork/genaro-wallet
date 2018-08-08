import { Component, OnInit, Input, OnDestroy, HostListener, ElementRef, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { CommitteeService } from '../../services/committee.service';
import { BrotherhoodService } from '../../services/brotherhood.service';

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
    let self = this;
    this.currentSubscribe = this.committeeService.currentMainWalletState.subscribe((data) => {
      if(data.address) {
        data.shortAddr = data.address.slice(0, 6);
      }
      self.accountTeamInfo = data || {};
    });
  }
  rankDestroy() {
    if(this.currentSubscribe) {
      this.currentSubscribe.unsubscribe();
    }
  }

  paddingTeamInfo: any = {};
  showPaddingTeam = false;
  showApplyTeam = false;
  hasTempSubAccount = false;
  paddingSubscribe: any;
  async committeeInit() {
    let self = this;
    this.paddingSubscribe = this.committeeService.paddingMainWalletState.subscribe((data) => {
      if(data.address) {
        data.shortAddr = data.address.slice(0, 6);
      }
      self.paddingTeamInfo = data || {};
      self.hasTempSubAccount = false;
      if(self.paddingTeamInfo.tempAccounts && self.paddingTeamInfo.tempAccounts.length > 0) {
        self.hasTempSubAccount = true;
      }
    });
  }
  committeeDestroy() {
    if(this.paddingSubscribe) {
      this.paddingSubscribe.unsubscribe();
    }
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
