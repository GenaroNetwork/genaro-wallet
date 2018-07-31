import { Component, OnInit } from '@angular/core';
import { CommitteeService } from '../../services/committee.service';
import { TransactionService } from '../../services/transaction.service';
import { BrotherhoodService } from '../../services/brotherhood.service';
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
    private brotherhoodService: BrotherhoodService,
    private walletService: WalletService
  ) { }

  ngOnInit() {
  }

}
