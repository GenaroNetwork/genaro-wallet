import { Component, OnInit, OnDestroy } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';
import { STAKE_PER_NODE } from "../../libs/config";

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
  walletSub: any;
  stakeData: any;
  constructor(
    private txService: TransactionService,
    private walletService: WalletService,
  ) {
    this.walletSub = this.walletService.currentWallet.subscribe(wallet => {
      if (!wallet) return;
      this.txService.getHeft(wallet.address).then(heft => {
        this.heft = Number(heft)
      });
      this.txService.getStake(wallet.address).then(val => {
        this.stakeAll = Math.floor(Number(val) / STAKE_PER_NODE);
      });

      this.txService.getNodes(wallet.address).then(val => {
        this.staked = val.length;
      });

      fetch("http://118.31.61.119:8000/top-farmer").then(val => {
        val.json().then(arr => {
          let addr = wallet.address;
          if (!addr.startsWith("0x")) addr = "0x" + addr;
          let me = arr.filter(farmer => farmer.address === addr);
          if (me.length === 0) this.heftRank = "300+";
          else {
            this.heftRank = me[0].order + 1;
          }
        });
      });
    });
  }

  tableChange: number = 0;

  ngOnInit() {
  }

  ngOnDestroy() {
    this.walletSub.unsubscribe()
  }

}
