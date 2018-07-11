import { Component, OnInit, OnDestroy } from '@angular/core';
import { WalletService } from '../../services/wallet.service';
import { TxEdenService } from '../../services/txEden.service';

@Component({
  selector: 'app-txEden',
  templateUrl: './txEden.component.html',
  styleUrls: ['./txEden.component.scss']
})
export class TxEdenComponent implements OnInit, OnDestroy {

  constructor(
    private wallet: WalletService,
    private txEden: TxEdenService,
  ) {
  }

  dialogName: string = null;
  requestPasswordValue: string = "";
  loadState() {
  }

  ngOnInit() {
    this.loadState();
  }

  async requestPasswordDone() {
    this.txEden.beforehandSign(this.requestPasswordValue);
    this.txEden.getBuckets();
    this.txEden.getUserInfo();
    this.txEden.requestPassword.next(false);
  }

  requestPasswordCancel() {
    this.txEden.requestPassword.next(false);
  }

  ngOnDestroy() {

  }

}
