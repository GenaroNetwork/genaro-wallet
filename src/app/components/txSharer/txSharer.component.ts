import { Component, OnInit, ApplicationRef, OnDestroy } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-txSharer',
  templateUrl: './txSharer.component.html',
  styleUrls: ['./txSharer.component.scss']
})
export class TxSharerComponent implements OnInit, OnDestroy {

  heft: number = 0;
  heftRank: number = 0;
  walletSub: any;
  stakeData: any;
  constructor(
    private app: ApplicationRef,
    private txService: TransactionService,
    private walletService: WalletService,
  ) {
    this.walletSub = this.walletService.currentWallet.subscribe(wallet => {
      if (!wallet) return;
      this.txService.getHeft(wallet.address).then(heft => {
        this.heft = Number(heft)
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
