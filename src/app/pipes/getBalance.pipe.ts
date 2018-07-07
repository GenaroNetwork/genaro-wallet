import { Pipe, PipeTransform } from '@angular/core';
import { TransactionService } from "../services/transaction.service";
import { WalletService } from '../services/wallet.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { fromWei } from "web3-utils";

@Pipe({
  name: 'getBalance'
})
export class GetBalancePipe implements PipeTransform {
  constructor(
    private txService: TransactionService,
    private walletService: WalletService,
  ) { }

  transform(value: any, unit: string = 'ether', address: string = null): any {
    return new Observable<any>(bs => {
      if (address) {
        /* 指定 address */
        this.txService.getBalance(address).then(val => {
          bs.next(fromWei(val, unit));
        });
        return;
      } else {
        /* 当前 address */
        this.walletService.currentWallet.subscribe(wallet => {
          if (!wallet) return;
          this.txService.getBalance(wallet.address).then(val => {
            bs.next(fromWei(val, unit));
          });
        }).unsubscribe();
      }
    });
  }

}
