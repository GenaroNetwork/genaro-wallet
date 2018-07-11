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
    public walletService: WalletService, // 在 html 中使用
    public txService: TransactionService, // 在 html 中使用
    public txDbService: TransactionDbService,  // 在 html 中使用
  ) { }
  popoverSendVisible: boolean = false;
  dialogName: string = null;


  async ngOnInit() {
  }

}
