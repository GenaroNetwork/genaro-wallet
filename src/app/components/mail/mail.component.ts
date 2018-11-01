import { Component, OnInit } from '@angular/core';
import { EdenService } from '../../services/eden.service';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss']
})
export class MailComponent implements OnInit {

  public path: string = null;
  public edenDialogName: string = null;
  public edenDialogOpt: any = null;

  // inbox 内可以保存 receive bucketid 或其他数据，保证存在 inbox 时 !receive 为 false 即可。 outbox 同理
  public inbox: string = null;
  public outbox: string = null;

  public mails: any[] = [];

  constructor(
    public edenService: EdenService,
  ) { }

  ngOnInit() {
    this.edenService.updateAll();
    this.edenService.currentBuckets.forEach(bucket => {
      if (bucket.type === 1) this.outbox = bucket.id;
      if (bucket.type === 2) this.inbox = bucket.id;
    });
  }

  openInbox() {
    this.path = "inbox";
    this.edenService.changePath([this.inbox])
  }

  openOutbox() {
    this.path = "outbox";
    this.edenService.changePath([this.outbox])
  }

  sendMessage() {
    this.edenDialogName = "sendMessage";
    this.edenDialogOpt = this.outbox;
  }
}
