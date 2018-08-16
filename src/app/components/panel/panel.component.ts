import { Component, OnInit, Input, OnDestroy, HostListener, ElementRef, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { CommitteeService } from '../../services/committee.service';
import { BrotherhoodService } from '../../services/brotherhood.service';

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

  isSpinning: boolean = true;

  accountTeamInfo: any = {};
  showCurrentTeam = false;
  currentSubscribe: any;
  currentWalletSubscribe: any;
  async rankInit() {
    let self = this;
    this.currentWalletSubscribe = this.walletService.currentWallet.subscribe(w => {
      self.isSpinning = true;
    });
    this.currentSubscribe = this.committeeService.currentMainWalletState.subscribe((data) => {
      if(data && data.address) {
        data.shortAddr = data.address.slice(0, 6);
        if(data.currentAddress === '0x' + self.walletService.wallets.current) {
          self.isSpinning = false;
        }
      }
      self.accountTeamInfo = data || {};
    });
  }
  rankDestroy() {
    if(this.currentSubscribe) {
      this.currentSubscribe.unsubscribe();
    }
    if(this.currentWalletSubscribe) {
      this.currentWalletSubscribe.unsubscribe();
    }
  }

  pendingTeamInfo: any = {};
  showPendingTeam = false;
  showApplyTeam = false;
  hasTempSubAccount = false;
  pendingSubscribe: any;
  pendingWalletSubscribe: any;
  async committeeInit() {
    let self = this;
    this.pendingWalletSubscribe = this.walletService.currentWallet.subscribe(w => {
      self.isSpinning = true;
    });
    this.pendingSubscribe = this.committeeService.pendingMainWalletState.subscribe((data) => {
      if(data && data.address) {
        data.shortAddr = data.address.slice(0, 6);
        if(data.currentAddress === '0x' + self.walletService.wallets.current) {
          self.isSpinning = false;
        }
      }
      self.pendingTeamInfo = data || {};
      self.hasTempSubAccount = false;
      if(self.pendingTeamInfo.tempAccounts && self.pendingTeamInfo.tempAccounts.length > 0) {
        self.hasTempSubAccount = true;
      }
    });
  }
  committeeDestroy() {
    if(this.pendingSubscribe) {
      this.pendingSubscribe.unsubscribe();
    }
    if(this.pendingWalletSubscribe) {
      this.pendingWalletSubscribe.unsubscribe();
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
