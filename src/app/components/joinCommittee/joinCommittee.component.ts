import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NzMessageService } from 'ng-zorro-antd';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-joinCommittee',
  templateUrl: './joinCommittee.component.html',
  styleUrls: ['./joinCommittee.component.scss']
})
export class JoinCommitteeComponent implements OnInit {

  constructor(
    private alert: NzMessageService,
    private translate: TranslateService,
    private txService: TransactionService,
    private walletService: WalletService
  ) { }

  dialogName = '';
  mainAddress = '';
  async join(data) {
    const stake = await this.txService.getStake(this.walletService.wallets.current);
    if(parseInt(stake) === 0) {
      return this.alert.error(this.translate.instant('DRIVE.STAKE_FIRST_TIP'));
    }
    this.dialogName = 'joinCommittee';
    this.mainAddress = data.address;
  }

  agree(data) {
    this.dialogName = 'approveJoin';
    this.mainAddress = data.address;
  }

  relieve(data) {
    this.dialogName = 'relieve';
    this.mainAddress = data.address;
  }

  tableAction(event) {
    const name = event[0];
    const args = event.slice(1);
    if (this[name]) { this[name](...args); }
  }

  ngOnInit() {
  }

}
