import { Component, OnInit } from '@angular/core';
import { TranslateService } from '../../services/translate.service';
import { TransactionService } from '../../services/transaction.service';
import { BLOCK_COUNT_OF_ROUND } from '../../libs/config';

@Component({
  selector: 'app-currentCommittee',
  templateUrl: './currentCommittee.component.html',
  styleUrls: ['./currentCommittee.component.scss']
})
export class CurrentCommitteeComponent implements OnInit {

  constructor(
    private txService: TransactionService,
    private i18n: TranslateService,
  ) { }

  thisRoundFirstBlock = 0;
  nextRoundFirstBlock = 0;
  tipDialogName: string = '';
  tipOpt: any = {};
  async initBlockNumber() {
    const web3 = await this.txService.getWeb3Instance();
    const bno = await web3.eth.getBlockNumber();
    this.thisRoundFirstBlock = bno - bno % BLOCK_COUNT_OF_ROUND;
    this.nextRoundFirstBlock = this.thisRoundFirstBlock + BLOCK_COUNT_OF_ROUND;
  }

  tipClick() {
    this.tipDialogName = 'tips';
    this.tipOpt = {
      title: this.i18n.instant('SIDERBAR.COMMITTEE'),
      content: this.i18n.instant('MODEL.CURRENT_COMMITTEE_TIP')
    };
  }

  ngOnInit() {
    this.initBlockNumber();
  }

}
