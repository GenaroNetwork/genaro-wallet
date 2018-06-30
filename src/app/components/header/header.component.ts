import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { WalletService } from "../../services/wallet.service";
import { TranslateService } from '@ngx-translate/core';
import { TransactionService } from '../../services/transaction.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  emptyAccount: string;
  walletShown: boolean = false;
  blockHeight: number = null;
  constructor(
    private i18n: TranslateService,
    private txService: TransactionService,
    private walletService: WalletService, // 会在 html 中用到，
  ) { }

  ngOnInit() {

    setTimeout(() => {
      this.emptyAccount = this.i18n.instant("HEADER.NO_ACCOUNT");
    }, 0);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.

  }

}
