import { Component, OnInit } from '@angular/core';
import { EdenService } from '../../services/eden.service';
import { TxEdenService } from '../../services/txEden.service';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss']
})
export class MailComponent implements OnInit {

  public path: string = null;
  public edenDialogName: string = null;
  public edenDialogOpt: any = null;

  public mails: any[] = [];

  constructor(
    public edenService: EdenService,
    public txEdenService: TxEdenService,
    private alert: NzMessageService,
  ) { }

  ngOnInit() {
    this.edenService.updateAll();
    console.log(this.edenService.mail);
    this.txEdenService.mailFiles.subscribe((data) => {
      if(this.path === 'inbox') {
        this.mails = (data || {}).to;
      } else if (this.path === 'outbox') {
        this.mails = (data || {}).from;
      } else {
        this.mails = []; 
      }
    });
  }

  openInbox() {
    this.path = "inbox";
    this.edenService.changePath(["/", this.edenService.mail.inbox]);
    this.mails = (this.txEdenService.mailList || {}).to;
  }

  openOutbox() {
    this.path = "outbox";
    this.edenService.changePath(["/", this.edenService.mail.outbox]);
    this.mails = (this.txEdenService.mailList || {}).from;
  }

  sendMessage() {
    this.edenDialogName = "sendMessage";
    this.edenDialogOpt = this.edenService.mail.outbox;
  }

  showMessage(data) {
    this.edenDialogName = "openMessage";
    let file = this.getFileByShare(data);
    if(!file) {
      this.alert.error("未找到邮件");
      return;
    }
    this.edenDialogOpt = {
      file: file,
      bucketId: this.edenService.currentPathId[0]
    };
  }

  deleteMessage(data) {
    this.edenDialogName = "deleteMessage";
    let file = this.getFileByShare(data);
    this.edenDialogOpt = {
      fileId: file ? file.id : '',
      shareId: data._id
    };
  }

  getFileByShare(share) {
    const {bucketEntryId, key, ctr} = share;
    let file;
    for(let i = 0, length = this.edenService.currentFiles.length; i < length; i++) {
      let f = this.edenService.currentFiles[i];
      if(f.id === bucketEntryId) {
        file = f;
        break;
      }
      if(f.rsaKey === key && f.rsaCtr == ctr) {
        file = f;
        break;
      }
    }
    return file;
  }
}
