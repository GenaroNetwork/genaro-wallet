import { Component, OnInit, Input, OnDestroy, HostListener, ElementRef, OnChanges, SimpleChange } from '@angular/core';
import { SharerService } from '../../services/sharer.service';
import { TransactionDbService } from '../../services/transaction-db.service';
import { TransactionService } from '../../services/transaction.service';
import { WalletService } from '../../services/wallet.service';
import { TxEdenService } from '../../services/txEden.service';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy, OnChanges {

  @Input("name") name: string;
  @Input("opt") opt: any;
  @Input("change") change: number;

  @HostListener('window:resize', ['$event'])
  onResize(event) {

  }

  ngOnChanges(changes: { [prop: string]: SimpleChange }) {
    if (changes.change) {
      if (this[`${name}Change`]) this[`${name}Change`]();
    }
  }

  constructor(
    public sharer: SharerService,
    public txdb: TransactionDbService,
    public el: ElementRef,
    public txService: TransactionService,
    public walletService: WalletService,
    public txEdenSercvice: TxEdenService,
  ) { }

  txData: any[];
  txDisplayData: any[];
  txType: string = "TYPE_ALL";
  txSub: any;
  transactionInit() {
    this.txUpdateData();
    this.txSub = this.txService.newBlockHeaders.subscribe(async () => {
      this.txUpdateData();
    });
  }
  transactionChange() {
    this.txUpdateData();
  }
  transactionDestory() {
    this.txSub.unsubscribe();
  }

  async txUpdateData() {
    // @ts-ignore
    this.txData = await this.txdb.getTransactions(null, null);
    let data = this.txData;
    //data = data.sort();
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
    this.txDisplayData = data;
  }
  txGetBlockNumber(receipt) {
    if (!receipt) return "-";
    return JSON.parse(receipt).blockNumber;
  }
  txChangeType(type: string) {
    this.txType = type;
    this.txUpdateData();
  }

  //txEden
  txEdenData: any[];
  txEdenSub: any;
  txEdenInit() {
    this.txEdenSub = this.walletService.currentWallet.subscribe(async wallet => {
      if (!wallet) return;
      this.txEdenDataUpdate();
    });
  }
  txEdenChange() {
    this.txEdenDataUpdate();
  }
  txEdenDestroy() {
    this.txEdenSub.unsubscribe();
  }
  txEdenDataUpdate = () => {
    this.txEdenSercvice.getBuckets();
    /*let walletAddr = null;
    return async (addr: string = null) => {
      if (!addr) addr = walletAddr;
      if (!addr) return;
      walletAddr = addr;

    }*/
  };


  // tx sharer
  txSharerData: any[] = [];
  txSharerSub: any;
  txSharerInit() {
    this.txSharerSub = this.walletService.currentWallet.subscribe(async wallet => {
      if (!wallet) return;
      this.txSharerDataUpdate(wallet.address);
    });
  }
  txSharerChange() {
    this.txSharerDataUpdate();
  }
  txSharerDestroy() {
    this.txSharerSub.unsubscribe();
  }
  txSharerDataUpdate = (() => {
    let walletAddr = null;
    return async (addr: string = null) => {
      if (!addr) addr = walletAddr;
      if (!addr) return;
      walletAddr = addr;
      let data = await this.txService.getNodes(addr);
    }
  })();



  ngOnInit() {
    if (this[`${this.name}Init`]) this[`${this.name}Init`]();
  }

  ngOnDestroy() {
    if (this[`${this.name}Destroy`]) this[`${this.name}Destroy`]();
  }

}
