import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';
import { SharerService } from '../../services/sharer.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {

  @Input("name") name: string = null;
  @Input("opts") options: any = {};
  @Input("nodeId") nodeId: string = null;

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
  selectBindNodes: string[] = [];
  bindNodeStep: number = 0;
  bindNodeTokenFlg: boolean = false;
  bindNodeId: string = "";
  bindNodeToken: any = "";
  bindNodeGas: number[] = [null, 2100000];
  bindNodePassword: string = "";
  async bindNodeConfirm() {
    let address = this.walletService.wallets.current;
    if(!this.bindNodeTokenFlg) {
      this.bindNodeToken = await this.getNodeToken(this.bindNodeId, address);
    }
    await this.txService.bindNode(address, this.bindNodePassword, this.bindNodeToken , this.bindNodeGas[1], this.bindNodeGas[0]);
    this.bindNodeStep++;
    this.onSubmit.emit();
  }

  setNodeId() {
    if(this.bindNodeId === "0") {
      this.bindNodeId = "";
      this.bindNodeTokenFlg = true;
    }
  }

  async getNodeToken(nodeId, address) {
    return new Promise(res => {
      this.sharerService.getBindToken(nodeId, address, (err, token) => {
        res(token);
      });
    });
  }

  // 解绑节点
  removeNodeStep: number = 0;
  removeNodeId: string = "";
  removeNodeGas: number[] = [null, 2100000];
  removeNodePassword: string = "";
  async removeNodeConfirm() {
    let address = this.walletService.wallets.current;
    await this.txService.removeNode(address, this.removeNodePassword, this.removeNodeId, this.removeNodeGas[1], this.removeNodeGas[0]);
    this.removeNodeStep++;
    this.onSubmit.emit();
  }

  constructor(
    private txService: TransactionService,
    private walletService: WalletService,
    private sharerService: SharerService
  ) {
  }

  ngOnInit() { 
    if (this.name === "removeNode") {
      this.removeNodeId = this.nodeId;
    }
    else if (this.name === "bindNode") {
      this.selectBindNodes = this.sharerService.getSharerNodeIds();
      if(this.selectBindNodes.length === 0) {
        this.bindNodeTokenFlg = true;
      }
    }
  }

}
