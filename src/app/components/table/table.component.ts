import { Component, OnInit, Input, OnDestroy } from '@angular/core';
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

  constructor(
    public sharer: SharerService,
    public txdb: TransactionDbService,
  ) { }

  txData: any[];
  async ngOnInit() {
    // @ts-ignore
    this.txData = await this.txdb.getTransactions(null, null);
    console.log(this.txData);
  }

  ngOnDestroy() { }

}
