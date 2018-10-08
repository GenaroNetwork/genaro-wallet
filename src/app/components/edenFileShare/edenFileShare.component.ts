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
  dialogName: string = '';
  dialogOpt: any = {};

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

  delete(data) {
    this.dialogOpt = data;
    this.dialogName = 'deleteShare';
  }

  tableAction(event) {
    const name = event[0];
    const args = event.slice(1);
    if (this[name]) { this[name](...args); }
  }

  ngOnDestroy() {
    this.walletSub.unsubscribe();
  }

}
