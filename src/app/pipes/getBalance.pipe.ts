import { Pipe, PipeTransform } from '@angular/core';
import { TransactionService } from "../services/transaction.service";
import { WalletService } from '../services/wallet.service';
import { BehaviorSubject } from 'rxjs';

@Pipe({
  name: 'getBalance'
})
export class GetBalancePipe implements PipeTransform {
  constructor(
    private txService: TransactionService,
    private walletService: WalletService,
  ) { }

  transform(value: any, address: string = null): any {
    let bs = new BehaviorSubject<any>(0);

    /* 指定 address */
    if (address) {
      this.txService.getBalance(address).then(val => bs.next);
      return;
    }

    /* 当前 address */
    this.walletService.currentWallet.subscribe(wallet => {
      if (!wallet) return;
      this.txService.getBalance(wallet.address).then(val => bs.next);
      return;
    });

    return bs;
  }

}
