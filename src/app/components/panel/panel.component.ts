import { Component, OnInit, Input, OnDestroy, HostListener, ElementRef, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { TranslateService } from '../../services/translate.service';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';
import { CommitteeService } from '../../services/committee.service';
import { BrotherhoodService } from '../../services/brotherhood.service';
import { BLOCK_COUNT_OF_ROUND } from '../../libs/config';

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
  currentWalletAddr: string = '';
  tipDialogName: string = '';
  tipOpt: any = {};
  effectBlock: number = 0;

  accountTeamInfo: any = {};
  showCurrentTeam = false;
  currentSubscribe: any;
  currentWalletSubscribe: any;
  async rankInit() {
    this.getEffectBlock();
    let self = this;
    this.currentWalletSubscribe = this.walletService.currentWallet.subscribe(w => {
      self.isSpinning = true;
      self.currentWalletAddr = '0x' + self.walletService.wallets.current;
    });
    this.currentSubscribe = this.committeeService.currentMainWalletState.subscribe((data) => {
      if (data && data.address) {
        data.shortAddr = data.address.slice(0, 6);
        if (data.currentAddress === '0x' + self.walletService.wallets.current) {
          self.isSpinning = false;
        }
      }
      self.accountTeamInfo = data || {};
    });
  }
  rankDestroy() {
    if (this.currentSubscribe) {
      this.currentSubscribe.unsubscribe();
    }
    if (this.currentWalletSubscribe) {
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
    this.getEffectBlock();
    let self = this;
    this.pendingWalletSubscribe = this.walletService.currentWallet.subscribe(w => {
      self.isSpinning = true;
      self.currentWalletAddr = '0x' + self.walletService.wallets.current;

      if (self.pendingSubscribe) {
        self.pendingSubscribe.unsubscribe();
      }
      self.pendingSubscribe = self.committeeService.pendingMainWalletState.subscribe((data) => {
        if (data && data.address) {
          data.shortAddr = data.address.slice(0, 6);
          if (data.currentAddress === '0x' + self.walletService.wallets.current) {
            self.isSpinning = false;
          }
        }
        self.pendingTeamInfo = data || {};
        self.hasTempSubAccount = false;
        if (self.pendingTeamInfo.tempAccounts && self.pendingTeamInfo.tempAccounts.length > 0) {
          self.hasTempSubAccount = true;
        }
      });
    });
  }
  committeeDestroy() {
    if (this.pendingSubscribe) {
      this.pendingSubscribe.unsubscribe();
    }
    if (this.pendingWalletSubscribe) {
      this.pendingWalletSubscribe.unsubscribe();
    }
  }

  async getEffectBlock() {
    const web3 = await this.txService.getWeb3Instance();
    // @ts-ignore
    const bno = await web3.eth.getBlockNumber();
    this.effectBlock = bno - bno % BLOCK_COUNT_OF_ROUND + BLOCK_COUNT_OF_ROUND;
  }

  tipClick(flg) {
    this.tipDialogName = 'tips';
    if (flg === 1) {
      this.tipOpt = {
        title: this.i18n.instant('SIDERBAR.CURRENT_RANKS'),
        content: this.i18n.instant('MODEL.CURRENT_RANKS_TIP')
      };
    }
    else if (flg === 2) {
      this.tipOpt = {
        title: this.i18n.instant('SIDERBAR.JOIN_COMMITTEE'),
        content: this.i18n.instant('MODEL.JOIN_COMMITTEE_TIP')
      };
    }
  }

  constructor(
    public walletService: WalletService,
    public committeeService: CommitteeService,
    public brotherhoodService: BrotherhoodService,
    private i18n: TranslateService,
    private txService: TransactionService,
  ) { }

  ngOnInit() {
    if (this[`${this.name}Init`]) {
      this[`${this.name}Init`]();
    }
  }

  ngOnChanges(changes: { [prop: string]: SimpleChange }) {
    let name = changes.name.currentValue;
    if (this[`${name}Change`]) { this[`${name}Change`](); }
  }

  ngOnDestroy() {
    if (this[`${this.name}Destroy`]) {
      this[`${this.name}Destroy`]();
    }
  }
}
