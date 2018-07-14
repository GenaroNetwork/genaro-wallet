import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  @Input("name") name: string = null;
  @Input("opts") options: any = {};

  @Output("submit") onSubmit: EventEmitter<any> = new EventEmitter;
  @Output("cancel") onCancel: EventEmitter<any> = new EventEmitter;
  @Output("error") onError: EventEmitter<any> = new EventEmitter;

  cancel() {
    this.onCancel.emit();
  }

  // send transaction
  formSendTx: any = {
    gasMin: 1,
    gasMax: 100,
    gasDetail: false,
    loading: false,
    // ==
    address: "",
    amount: 0,
    gas: [null, 21000],
    password: "",
  };
  async submitSendTx() {
    let from = this.walletService.wallets.current;
    let to = this.formSendTx.address;
    if (to.startsWith("0x")) to = to.substr(2);
    await this.txService.transfer(from, this.formSendTx.password, to, this.formSendTx.amount, this.formSendTx.gas[1], this.formSendTx.gas[0]);
    this.onSubmit.emit();
  }

  // 压注
  stakeType: number = 0; // stake or unstake
  stakeStep: number = 0;
  stakeGNX: number = 0;
  stakeGas: number[] = [null, 2100000];
  stakePassword: string = "";
  async  stakeConfirm() {
    switch (this.stakeType) {
      case 0:
        let address = this.walletService.wallets.current;
        await this.txService.stake(address, this.stakePassword, this.stakeGNX, this.stakeGas[1], this.stakeGas[0]);
        this.stakeStep++;
        this.onSubmit.emit();
        break;
    }
  }

  // 绑定节点
  bindNodeStep: number = 0;
  bindNodeId: string = "";
  bindNodeGas: number[] = [null, 2100000];
  bindNodePassword: string = "";
  async bindNodeConfirm() {
    let address = this.walletService.wallets.current;
    await this.txService.bindNode(address, this.bindNodePassword, [this.bindNodeId], this.bindNodeGas[1], this.bindNodeGas[0]);
    this.bindNodeStep++;
    this.onSubmit.emit();
  }



  constructor(
    private txService: TransactionService,
    private walletService: WalletService,
  ) {
  }

  ngOnInit() { }

}
