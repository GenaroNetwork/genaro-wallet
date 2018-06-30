import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { TransactionService } from '../../services/transaction.service';
import { clipboard } from 'electron';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {

  constructor(
    private walletService: WalletService, // 在 html 中使用
    private txService: TransactionService,  // 在 html 中使用
  ) { }

  copied: string = null;
  copyWalletAddr() {
    this.walletService.currentWallet.subscribe(wallet => {
      clipboard.writeText(`0x${wallet.address}`);
      this.copied = "wallet-address";
      setTimeout(() => {
        this.copied = null;
      }, 1000);
    }).unsubscribe();
  };

  ngOnInit() {
  }

}
