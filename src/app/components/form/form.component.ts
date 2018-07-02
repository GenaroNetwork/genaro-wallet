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
    // ==
    address: "",
    amount: 0,
    gas: 1,
    gasLimit: 21000,
    password: "",
  };
  submitSendTx() {
    this.walletService.currentWallet.subscribe(wallet => {
      let from = wallet.address;
      let to = this.formSendTx.address;
      if (to.startsWith("0x")) to = to.substr(2);
      this.txService.transfer(from, this.formSendTx.password, to, this.formSendTx.amount, this.formSendTx.gasLimit, this.formSendTx.gas)
        .then((...args) => {
          console.log(...args);
          this.onSubmit.emit();
        })
        .catch(err => {
          console.log(err);
          debugger;
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
