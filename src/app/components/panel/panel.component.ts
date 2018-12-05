import { Component, OnInit, Input, OnDestroy, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
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

  isSpinning: boolean = true;
  currentWalletAddr: string = '';
  tipDialogName: string = '';
  tipOpt: any = {};
  effectBlock: number = 0;

  accountTeamInfo: any = {};
  showCurrentTeam = false;
  currentWalletSubscribe: any;
  async rankInit() {
    this.getEffectBlock();
    let self = this;
    this.currentWalletSubscribe = this.walletService.currentWallet.subscribe(wallet => {
      self.isSpinning = true;
      self.currentWalletAddr = '0x' + self.walletService.wallets.current;
    });
  }
  rankDestroy() {
    if (this.currentWalletSubscribe) {
      this.currentWalletSubscribe.unsubscribe();
    }
  }

  showPendingTeam = false;
  showApplyTeam = false;
  hasTempSubAccount = false;
  pendingWalletSubscribe: any;
  async committeeInit() {
    this.getEffectBlock();
    let self = this;
    this.pendingWalletSubscribe = this.walletService.currentWallet.subscribe(wallet => {
      self.isSpinning = true;
      self.currentWalletAddr = '0x' + self.walletService.wallets.current;
    });
  }
  committeeDestroy() {
    if (this.pendingWalletSubscribe) {
      this.pendingWalletSubscribe.unsubscribe();
    }
  }

  async getEffectBlock() {
    const web3 = await this.txService.getWeb3Instance();
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
