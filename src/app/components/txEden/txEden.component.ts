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
  requestPassword: boolean = false;
  requestPasswordValue: string = "";
  loadState() {
    this.wallet.currentWallet.subscribe(wallet => {
      if (!wallet) return;
      let data = this.txEden.getUserInfo();
    });
  }

  ngOnInit() {
    this.loadState();
    this.txEden.passwordEvent.on("request", () => {
      this.requestPassword = true;
    });
  }

  async requestPasswordDone() {
    this.txEden.beforehandSign(this.requestPasswordValue);
    this.requestPassword = false;
    this.txEden.passwordEvent.emit("resolve");
  }

  requestPasswordCancel() {
    this.requestPassword = false;
    this.txEden.passwordEvent.emit("reject");
  }

  ngOnDestroy() {

  }

}
