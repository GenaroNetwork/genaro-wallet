import { Component, OnInit, OnDestroy } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';
import { STAKE_PER_NODE, SENTINEL_WEB, TOP_FARMER_URL } from "../../libs/config";
import { shell } from "electron";

@Component({
  selector: 'app-txSharer',
  templateUrl: './txSharer.component.html',
  styleUrls: ['./txSharer.component.scss']
})
export class TxSharerComponent implements OnInit, OnDestroy {

  heft: number = 0;
  heftRank: string = "-";
  staked: number = 0;
  stakeAll: number = 0;
  stakeAmount: number = 0;
  walletSub: any;
  newBlockSub: any;
  stakeData: any;
  constructor(
    private txService: TransactionService,
    private walletService: WalletService,
  ) { }

  async updateValue() {
    let address = this.walletService.wallets.current;
    if (!address) return;
    this.txService.getHeft(address).then(heft => {
      if (!heft) this.heft = 0;
      else this.heft = Number(heft);
    });
    this.txService.getStake(address).then(val => {
      if (!val) {
        this.stakeAll = 0;
        this.stakeAmount = 0;
      }
      else {
        this.stakeAll = Math.floor(Number(val) / STAKE_PER_NODE);
        this.stakeAmount = Number(val);
      }
    });
    this.txService.getNodes(address).then(val => {
      if (!val) this.staked = 0;
      else this.staked = val.length;
    });
    let res = await fetch(TOP_FARMER_URL);
    let json = await res.json();
    let addr = address;
    if (!addr.startsWith("0x")) addr = "0x" + addr;
    let me = json.filter(farmer => farmer.address === addr);
    if (me.length === 0) this.heftRank = "300+";
    else {
      this.heftRank = me[0].order + 1;
    }
  }

  tableChangeIndex: number = 0;

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
