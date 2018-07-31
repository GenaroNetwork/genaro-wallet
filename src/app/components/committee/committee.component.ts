import { Component, OnInit } from '@angular/core';
import { CommitteeService } from '../../services/committee.service';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-committee',
  templateUrl: './committee.component.html',
  styleUrls: ['./committee.component.scss']
})
export class CommitteeComponent implements OnInit {

  constructor(
    private committeeService: CommitteeService,
    private transactionService: TransactionService,
    private walletService: WalletService
  ) { }

  join(data) {
   
  }

  getSubAccounts() {
    if(this.walletService.wallets.current) {
      this.transactionService.getCurrentSubAccounts(this.walletService.wallets.current.address);
    }
    
    

  }

  tableAction(event) {
    let name = event[0];
    let args = event.slice(1);
    if (this[name]) this[name](...args);
  }

  ngOnInit() {
  }

}
