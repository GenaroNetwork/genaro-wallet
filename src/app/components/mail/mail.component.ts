import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss']
})
export class MailComponent implements OnInit {

  public path: string = null;
  public edenDialogName: string = null;
  public edenDialogOpt: any = null;

  // receiveBox 内可以保存 receive bucketid 或其他数据，保证存在 receiveBox 时 !receive 为 false 即可。 sendBox 同理
  public receiveBox: string = "null";
  public sendBox: string = "null";

  public mails: any[] = [];

  constructor() { }

  openInbox() {

  }

  openOutbox() {

  }

  setInbox() {
    this.edenDialogName = 'setInbox';
    this.edenDialogOpt = '';
  }

  setOutbox() {
    this.edenDialogName = 'setOutbox';
    this.edenDialogOpt = '';
  }

  ngOnInit() {
  }

}
