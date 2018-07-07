import { Component, OnInit, ApplicationRef } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-txSharer',
  templateUrl: './txSharer.component.html',
  styleUrls: ['./txSharer.component.scss']
})
export class TxSharerComponent implements OnInit {

  heft: number = 0;
  heftRank: number = 0;
  constructor(
    private app: ApplicationRef,
    private txService: TransactionService,
    private walletService: WalletService,
  ) {
  }

  ngOnInit() {
  }

}
