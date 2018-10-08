import { Component, OnInit, OnDestroy } from '@angular/core';
import { TxEdenService } from '../../services/txEden.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-edenFileReceive',
  templateUrl: './edenFileReceive.component.html',
  styleUrls: ['./edenFileReceive.component.scss']
})
export class EdenFileReceiveComponent implements OnInit, OnDestroy {

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

  ngOnDestroy() {
    this.walletSub.unsubscribe();
  }

  agree(data) {
    this.dialogOpt = data;
    this.dialogName = 'agreeShare';
  }

  reject(data) {
    this.dialogOpt = data;
    this.dialogName = 'rejectShare';
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

}
