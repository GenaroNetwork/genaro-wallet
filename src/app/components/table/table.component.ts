import { Component, OnInit, Input } from '@angular/core';
import { SharerService } from '../../services/sharer.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {

  @Input("name") name: string;
  @Input("opt") opt: any;

  constructor(
    public sharer: SharerService,
  ) { }

  ngOnInit() {
  }

}
