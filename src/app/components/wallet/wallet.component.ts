import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { clipboard } from 'electron';
import { TransactionDbService } from '../../services/transaction-db.service';
import { TransactionService } from '../../services/transaction.service';
//const storj = require("storj-lib");

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

  constructor(
    private walletService: WalletService, // 在 html 中使用
    private txService: TransactionService,
    private txDbService: TransactionDbService,  // 在 html 中使用
  ) { }

  copied: string = null;
  popoverSendVisible: boolean = false;
  dialogName: string = null;

  displayTxData: any = [];
  allTxData: any;

  copyWalletAddr() {
    this.walletService.currentWallet.subscribe(wallet => {
      clipboard.writeText(`0x${wallet.address}`);
      this.copied = "wallet-address";
      setTimeout(() => {
        this.copied = null;
      }, 1000);
    }).unsubscribe();
  };

  async ngOnInit() {
    this.allTxData = await this.txDbService.getTransactions(1, 1);
  }

}
