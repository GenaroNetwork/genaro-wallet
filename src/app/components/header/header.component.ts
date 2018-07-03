import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from "../../services/wallet.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  walletNewShown: boolean = false;
  blockHeight: number = null;
  constructor(
    private txService: TransactionService, // 会在 html 中用到，
    private walletService: WalletService, // 会在 html 中用到，
  ) { }

  ngOnInit() {
    this.walletService.currentWallet.subscribe(wallet => {
      if (wallet === null) this.walletNewShown = true;
    });
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.

  }

}
