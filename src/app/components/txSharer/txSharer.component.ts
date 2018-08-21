import { Component, OnInit, OnDestroy } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';
import { CommitteeService } from '../../services/committee.service';
import { STAKE_PER_NODE, SENTINEL_WEB } from '../../libs/config';
import { shell } from 'electron';

@Component({
  selector: 'app-txSharer',
  templateUrl: './txSharer.component.html',
  styleUrls: ['./txSharer.component.scss']
})
export class TxSharerComponent implements OnInit, OnDestroy {

  heft = 0;
  heftRank = '-';
  staked = 0;
  stakeAll = 0;
  stakeAmount = 0;
  walletSub: any;
  newBlockSub: any;
  stakeData: any;
  constructor(
    private txService: TransactionService,
    private walletService: WalletService,
    private committeeService: CommitteeService
  ) { }

  async updateValue() {
    const address = this.walletService.wallets.current;
    if (!address) { return; }
    // this.txService.getHeft(address).then(heft => {
    //   if (!heft) { this.heft = 0; } else { this.heft = Number(heft); }
    // });
    this.txService.getStake(address).then(val => {
      if (!val) {
        this.stakeAll = 0;
        this.stakeAmount = 0;
      } else {
        this.stakeAll = Math.floor(Number(val) / STAKE_PER_NODE);
        this.stakeAmount = Number(val);
      }
    });
    this.txService.getNodes(address).then(val => {
      if (!val) { this.staked = 0; } else { this.staked = val.length; }
    });

    let allCommittees = this.committeeService.getPendingSentinelRankDatas();
    this.heft = 0;
    this.heftRank = '300+';

    if (allCommittees) {
      let addr = address;
      if (!addr.startsWith('0x')) { addr = '0x' + addr; }

      for(let i = 0, length = allCommittees.length; i< length; i++) {
        if(addr === allCommittees[i].address) {
          this.heft = allCommittees[i].pendingSentinel;
          this.heftRank = allCommittees[i].order + 1;
          break;
        }
        if(allCommittees[i].pendingSubFarmers && allCommittees[i].pendingSubFarmers.length > 0) {
          for(let j = 0, lj = allCommittees[i].pendingSubFarmers.length; j< lj; j++) {
            if(addr === allCommittees[i].pendingSubFarmers[j].address) {
              this.heftRank = allCommittees[i].order + 1;
              break;
            }
          }
        }
        if(this.heftRank !== '300+') {
          break;
        }
      }
    }    
  }

  tableChangeIndex = 0;

  openSentinel() {
    shell.openExternal(SENTINEL_WEB);
  }

  ngOnInit() {
    this.walletSub = this.walletService.currentWallet.subscribe(() => this.updateValue());
    this.newBlockSub = this.txService.newBlockHeaders.subscribe(() => this.updateValue());
  }

  ngOnDestroy() {
    this.walletSub.unsubscribe();
    this.newBlockSub.unsubscribe();
  }

}
