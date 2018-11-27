import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChange } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';
import { SharerService } from '../../services/sharer.service';
import { BrotherhoodService } from '../../services/brotherhood.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnChanges {

  @Input('name') name: string = null;
  @Input('opts') options: any = {};

  @Output('submit') onSubmit: EventEmitter<any> = new EventEmitter;
  @Output('cancel') onCancel: EventEmitter<any> = new EventEmitter;
  @Output('error') onError: EventEmitter<any> = new EventEmitter;

  cancel() {
    this.onCancel.emit();
  }

  // send transaction
  sendTxStep = 0;
  sendTxGasMin = 1;
  sendTxGasMax = 100;
  sendTxGasDetail = false;
  sendTxLoading = false;
  // ==
  sendTxAddress = '';
  sendTxAmount = 0;
  sendTxGas = [null, 21000];
  sendTxPassword = '';
  async submitSendTx(e) {
    if (e === 'cancel') {
      this.sendTxStep = 0;
      return;
    }
    const from = this.walletService.wallets.current;
    let to = this.sendTxAddress;
    await this.txService.transfer(from, this.sendTxPassword, to, this.sendTxAmount, this.sendTxGas[1], this.sendTxGas[0]);
    this.onSubmit.emit();
  }

  // 压注
  stakeType = 0; // stake or unstake
  stakeUnstakable: Number = 0;
  stakeStep = 0;
  stakeGNX = 5000;
  stakeGas: number[] = [null, 2100000];
  stakePassword = '';
  async stakeInit() {
    let addr = this.walletService.wallets.current;
    let state = await this.bhService.fetchState(addr);
    this.stakeUnstakable = 0;
    if (state.pendingState.role === "Free") this.stakeUnstakable = 0;
    else this.stakeUnstakable = -1;
  }
  async  stakeConfirm() {
    const address = this.walletService.wallets.current;
    switch (this.stakeType) {
      case 0:
        await this.txService.stake(address, this.stakePassword, this.stakeGNX, this.stakeGas[1], this.stakeGas[0]);
        this.stakeStep++;
        this.onSubmit.emit();
        break;
      case 1:
        await this.txService.unStake(address, this.stakePassword, this.stakeGas[1], this.stakeGas[0]);
        this.stakeStep = 2;
        this.onSubmit.emit();
        break;
    }
  }

  // 绑定节点
  selectBindNodes: string[] = [];
  bindNodeStep = 0;
  bindNodeTokenFlg = false;
  bindNodeId = '';
  bindNodeToken: any = '';
  bindNodeGas: number[] = [null, 2100000];
  bindNodePassword = '';
  bindNodeInit() {
    this.selectBindNodes = this.sharerService.getSharerNodeIds();
    if (this.selectBindNodes.length === 0) {
      this.bindNodeTokenFlg = true;
    }
  }
  async bindNodeConfirm() {
    const address = this.walletService.wallets.current;
    if (!this.bindNodeTokenFlg) {
      this.bindNodeToken = await this.getNodeToken(this.bindNodeId, address);
    }
    await this.txService.bindNode(address, this.bindNodePassword, this.bindNodeToken, this.bindNodeGas[1], this.bindNodeGas[0]);
    this.bindNodeStep++;
    this.onSubmit.emit();
  }

  setNodeId() {
    if (this.bindNodeId === '0') {
      this.bindNodeId = '';
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
  removeNodeStep = 0;
  removeNodeId = '';
  removeNodeGas: number[] = [null, 2100000];
  removeNodePassword = '';
  removeNodeInit() {
    this.removeNodeId = this.options;
  }
  async removeNodeConfirm() {
    const address = this.walletService.wallets.current;
    await this.txService.removeNode(address, this.removeNodePassword, this.removeNodeId, this.removeNodeGas[1], this.removeNodeGas[0]);
    this.removeNodeStep++;
    this.onSubmit.emit();
  }
  removeNodeTipConfirm() {
    this.removeNodeStep++;
  }

  constructor(
    private txService: TransactionService,
    private walletService: WalletService,
    private sharerService: SharerService,
    private bhService: BrotherhoodService,
  ) {
  }

  ngOnChanges(changes: { [prop: string]: SimpleChange }) {
    if (changes.name) {
      let name = changes.name.currentValue;
      if (this[`${name}Init`]) this[`${name}Init`]();
    }
  }

}
