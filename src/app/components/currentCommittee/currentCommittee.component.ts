import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { BLOCK_COUNT_OF_ROUND } from '../../libs/config';

@Component({
  selector: 'app-currentCommittee',
  templateUrl: './currentCommittee.component.html',
  styleUrls: ['./currentCommittee.component.scss']
})
export class CurrentCommitteeComponent implements OnInit {

  constructor(
    private txService: TransactionService
  ) { }

  thisRoundFirstBlock: number = 0;
  nextRoundFirstBlock: number = 0;
  async initBlockNumber() {
    const web3 = await this.txService.getWeb3Instance();
    // @ts-ignore
    const bno = await web3.eth.getBlockNumber();
    this.thisRoundFirstBlock = bno - bno % BLOCK_COUNT_OF_ROUND;
    this.nextRoundFirstBlock = this.thisRoundFirstBlock + BLOCK_COUNT_OF_ROUND;
  }

  ngOnInit() {
    this.initBlockNumber();
  }

}
