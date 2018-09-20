import { Component, OnInit, OnDestroy } from '@angular/core';
import { TxEdenService } from '../../services/txEden.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-edenFileShare',
  templateUrl: './edenFileShare.component.html',
  styleUrls: ['./edenFileShare.component.scss']
})
export class EdenFileShareComponent implements OnInit, OnDestroy {

  constructor(
    public txEden: TxEdenService,
    private walletService: WalletService,
  ) { 
    this.txEden.getAll();
  }

  walletSub: any;
  ngOnInit() {
    this.txEdenUpdate();
    this.walletSub = this.walletService.currentWallet.subscribe(() => {
      this.txEden.clearAllSig();
      this.txEdenUpdate();
    });
  }

  async txEdenUpdate(force: boolean = true) {
    await this.txEden.getAll(force);
  }

  ngOnDestroy() {
    this.walletSub.unsubscribe();
  }

}
