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
    public txEdenService: TxEdenService,
  ) { }

  txData: any[];
  txDisplayData: any[];
  txType: string = "TYPE_ALL";
  txNewBlocksSub: any;
  txChangeWalletSub: any;
  transactionInit() {
    this.txUpdateData();
    this.txNewBlocksSub = this.txService.newBlockHeaders.subscribe(async () => {
      this.txUpdateData();
    });
    this.txChangeWalletSub = this.walletService.currentWallet.subscribe(wallet => {
      if (!wallet) return;
      this.txUpdateData();
    });
  }
  transactionChange() {
    this.txUpdateData();
  }
  transactionDestory() {
    this.txNewBlocksSub.unsubscribe();
    this.txChangeWalletSub.unsubscribe();
  }

  async txUpdateData() {
    this.walletService.currentWallet.subscribe(async wallet => {
      if (!wallet) return;

      // @ts-ignore
      this.txData = await this.txdb.getTransactions(null, null);
      let data = this.txData;
      data = data.filter(tx => tx.addrFrom === wallet.address || tx.addrTo === wallet.address);
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
    }).unsubscribe();
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
  }

  txSharerDataUpdate = (() => {
    let walletAddr = null;
    return async (addr: string = null) => {
      if (!addr) addr = walletAddr;
      if (!addr) return;
      let nodes = await this.txService.getNodes(addr);
      this.txSharerData = nodes;
    }
  })();

  txSharerDestroy() {
    this.txSharerSub.unsubscribe();
  }



  ngOnInit() {
    if (this[`${this.name}Init`]) this[`${this.name}Init`]();
  }

  ngOnDestroy() {
    if (this[`${this.name}Destroy`]) this[`${this.name}Destroy`]();
  }

}
