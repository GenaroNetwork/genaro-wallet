import { Component, OnInit, Input, OnDestroy, HostListener, ElementRef, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { SharerService } from '../../services/sharer.service';
import { TransactionDbService } from '../../services/transaction-db.service';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';
import { TxEdenService } from '../../services/txEden.service';
import { EdenService } from '../../services/eden.service';
import { TASK_STATE, TASK_TYPE } from '../../libs/config';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy, OnChanges {

  @Input("name") name: string;
  @Input("opt") opt: any;
  @Input("change") change: number;
  @Output("action") action: EventEmitter<any> = new EventEmitter;

  @HostListener('window:resize', ['$event'])
  onResize(event) {

  }

  ngOnChanges(changes: { [prop: string]: SimpleChange }) {
    if (changes.change) {
      if (this[`${name}Change`]) this[`${name}Change`]();
    }
  }

  constructor(
    public el: ElementRef,
    public sharer: SharerService,
    public txdb: TransactionDbService,
    public txService: TransactionService,
    public walletService: WalletService,
    public txEdenService: TxEdenService,
    public edenService: EdenService,
  ) { }

  txData: any[];
  txDisplayData: any[];
  txType: string = "TYPE_ALL";
  transactionChange = this.txUpdateData;
  transactionWalletSub = this.txUpdateData;
  transactionBlockSub = this.txUpdateData;
  txDataCurrentPage: number = 1;
  txDataTotalPage: number = 0;
  TASK_STATE = TASK_STATE;
  TASK_TYPE = TASK_TYPE;
  async txUpdateData() {
    let address = this.walletService.wallets.current;
    // @ts-ignore
    this.txData = await this.txdb.getTransactions(null, null);
    let data = this.txData;
    data = data.filter(tx => tx.addrFrom === address || tx.addrTo === address);
    if (this.txType !== "TYPE_ALL") {
      const types = {
        "TYPE_SEND": "TRANSFER",
        "TYPE_BUY_SPACE": "BUY_BUCKET",
        "TYPE_BUY_TRAFFIC": "BUY_TRAFFIC",
        "TYPE_STAKE": "STAKE_GNX",
        "TYPE_BIND_NODE": "BIND_NODE",
      }
      data = data.filter(tx => tx.txType === types[this.txType]);
    }
    data = data.sort((a, b) => b.created - a.created);
    this.txDataTotalPage = data.length;
    data = data.slice((this.txDataCurrentPage - 1) * 10, this.txDataCurrentPage * 10);
    this.txDisplayData = data;
  }
  txGetBlockNumber(receipt) {
    if (!receipt) return "-";
    return JSON.parse(receipt).blockNumber;
  }
  txChangeType(type: string) {
    this.txType = type;
    this.txDataCurrentPage = 1;
    this.txUpdateData();
  }
  txChangePage(page: number) {
    this.txDataCurrentPage = page;
    this.txUpdateData();
  }

  // //txEden
  // txEdenData: any = [];
  // txEdenWalletSub = this.txEdenDataUpdate;
  // txEdenBlockSub = this.txEdenDataUpdate;
  // txEdenDataUpdate(){
  //   this.txEdenData = this.txEdenService.bucketList;
  // }


  // tx sharer
  txSharerData: any[] = [];
  txSharerDataCurrentPage: number = 1;
  txSharerDataTotalPage: number = 0;
  txSharerWalletSub = this.txSharerDataUpdate;
  txSharerBlockSub = this.txSharerDataUpdate;
  async txSharerDataUpdate() {
    let address = this.walletService.wallets.current;
    let nodes = await this.txService.getNodes(address);
    if (nodes) {
      this.txSharerDataTotalPage = nodes.length;
      this.txSharerData = nodes.slice((this.txSharerDataCurrentPage - 1) * 10, this.txSharerDataCurrentPage * 10);
    }
  };
  txSharerChangePage(page: number) {
    this.txSharerDataCurrentPage = page;
    this.txSharerDataUpdate();
  }


  allWalletSub: any;
  allBlockSub: any;
  ngOnInit() {
    if (this[`${this.name}Init`]) this[`${this.name}Init`]();
    this.allWalletSub = this.walletService.currentWallet.subscribe(() => {
      if (this[`${this.name}WalletSub`]) this[`${this.name}WalletSub`]();
    });
    this.allBlockSub = this.txService.newBlockHeaders.subscribe(() => {
      if (this[`${this.name}BlockSub`]) this[`${this.name}BlockSub`]();
    });
  }

  ngOnDestroy() {
    if (this[`${this.name}Destroy`]) this[`${this.name}Destroy`]();
    this.allWalletSub.unsubscribe();
    this.allBlockSub.unsubscribe();
  }

}
