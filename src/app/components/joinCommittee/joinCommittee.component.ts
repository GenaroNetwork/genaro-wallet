import { Component, OnInit } from '@angular/core';
import { CommitteeService } from '../../services/committee.service';
import { TransactionService } from '../../services/transaction.service';
import { BrotherhoodService } from '../../services/brotherhood.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-joinCommittee',
  templateUrl: './joinCommittee.component.html',
  styleUrls: ['./joinCommittee.component.scss']
})
export class JoinCommitteeComponent implements OnInit {

  constructor(
    private committeeService: CommitteeService,
    private transactionService: TransactionService,
    private brotherhoodService: BrotherhoodService,
    private walletService: WalletService
  ) { }

  join(data) {
   
  }

  getSubAccounts() {
    if(this.walletService.wallets.current) {
      this.brotherhoodService.getCurrentSubAccounts(this.walletService.wallets.current.address);
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
