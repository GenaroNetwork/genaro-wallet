import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-joinCommittee',
  templateUrl: './joinCommittee.component.html',
  styleUrls: ['./joinCommittee.component.scss']
})
export class JoinCommitteeComponent implements OnInit {

  constructor(
  ) { }

  dialogName = '';
  mainAddress = '';
  join(data) {
    this.dialogName = 'joinCommittee';
    this.mainAddress = data.address;
  }

  agree(data) {
    this.dialogName = 'approveJoin';
    this.mainAddress = data.address;
  }

  tableAction(event) {
    const name = event[0];
    const args = event.slice(1);
    if (this[name]) { this[name](...args); }
  }

  ngOnInit() {
  }

}
