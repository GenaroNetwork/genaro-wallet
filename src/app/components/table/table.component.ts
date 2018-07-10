import { Component, OnInit, Input, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { SharerService } from '../../services/sharer.service';
import { TransactionDbService } from '../../services/transaction-db.service';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit, OnDestroy {

  @Input("name") name: string;
  @Input("opt") opt: any;

  @HostListener('window:resize', ['$event'])
  onResize(event) {

  }

  constructor(
    public sharer: SharerService,
    public txdb: TransactionDbService,
    public el: ElementRef,
  ) { }

  txData: any[];
  txType: string = "TABLE.TX.TYPE_ALL";
  async transactionInit() {
    // @ts-ignore
    this.txData = await this.txdb.getTransactions(null, null);
    console.log(this.txData);
  }
  txChangeType(type: string) {
    this.txType = `TABLE.TX.${type}`;

  }

  ngOnInit() {
    if (this[`${this.name}Init`]) this[`${this.name}Init`]();
  }

  ngOnDestroy() {
    if (this[`${this.name}Destroy`]) this[`${this.name}Destroy`]();
  }

}
