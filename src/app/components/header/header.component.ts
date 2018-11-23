import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';
import { SettingService } from '../../services/setting.service';
import { EdenService } from '../../services/eden.service';
import { setNetType } from '../../libs/config';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  walletNewShown = false;
  blockHeight: number = null;
  dialogName: string = null;
  netType: string = 'main';
  constructor(
    public txService: TransactionService, // 会在 html 中用到，
    public walletService: WalletService, // 会在 html 中用到，
    public setting: SettingService,
    public edenService: EdenService,
  ) { }

  ngOnInit() {
    this.walletService.currentWallet.subscribe(wallet => {
      if (wallet === null) { this.walletNewShown = true; }
    });
  }

  ngOnDestroy(): void {
    // Called once, before the instance is destroyed.
    // Add 'implements OnDestroy' to the class.

  }

  setNet(netType) {
    this.netType = netType;
    setNetType(netType);
    this.txService.connect();
    this.edenService.resetAll();
  }
}
