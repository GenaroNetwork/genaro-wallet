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
    gas: [2, 21000],
    password: "",
  };
  submitSendTx() {
    this.formSendTx.loading = true;
    setTimeout(() => {
      this.walletService.currentWallet.subscribe(wallet => {
        let from = wallet.address;
        let to = this.formSendTx.address;
        if (to.startsWith("0x")) to = to.substr(2);
        this.txService.transfer(from, this.formSendTx.password, to, this.formSendTx.amount, this.formSendTx.gas[1], this.formSendTx.gas[0])
          .then((...args) => {
            console.log(...args);
            this.onSubmit.emit();
            this.formSendTx.loading = false;
          })
          .catch(err => {
            console.log(err);
            this.formSendTx.loading = false;
          });
      }).unsubscribe();
    }, 0);
  }

  // 压注
  stakeType: number = 0;
  stakeStep: number = 0;
  stakeGNX: number = 0;
  stakeGas: number[];
  stakePassword: string = "";
  stakeConfirm() {
    switch (this.stakeType) {
      case 0:
        this.walletService.currentWallet.subscribe(wallet => {
          this.txService.stake(wallet.address, this.stakePassword, this.stakeGNX, this.stakeGas[1], this.stakeGas[0]).then(() => {
            this.onSubmit.emit();
            this.stakeStep++;
          });
        }).unsubscribe();
        break;
    }
  }

  // 绑定节点
  bindNodeStep: number = 0;
  bindNodeId: string = "";
  bindNodeGas: number[];
  bindNodePassword: string = "";
  bindNodeConfirm() {
    this.walletService.currentWallet.subscribe(wallet => {
      this.txService.bindNode(wallet.address, this.bindNodePassword, [this.bindNodeId], this.bindNodeGas[1], this.bindNodeGas[0]).then(() => {
        this.onSubmit.emit();
        this.bindNodeStep++;
      });
    }).unsubscribe();
  }



  constructor(
    private txService: TransactionService,
    private walletService: WalletService,
  ) {
  }

  ngOnInit() { }

}
