import { Component, OnInit } from '@angular/core';
import { NickNameService } from '../../services/nickName.service';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-nickName',
  templateUrl: './nickName.component.html',
  styleUrls: ['./nickName.component.scss']
})
export class NickNameComponent implements OnInit {

  constructor(
    private nickNameService: NickNameService,
    private i18n: TranslateService,
  ) { }

  dialogName: string = '';
  dialogOpt: any = {};

  ngOnInit() {
  }

  applyNick() {
    this.dialogName='applyNick';
    this.dialogOpt = {};
  }

  tipClick() {
    this.dialogName = 'tips';
    this.dialogOpt = {
      title: this.i18n.instant('SIDERBAR.NICK_MANAGE'),
      content: this.i18n.instant('MODEL.NICK_MANAGE_TIP')
    };
  }

  logOff(data) {
    this.dialogName='logOffNick';
    this.dialogOpt = data;
  }

  gift(data) {
    this.dialogName='giftNick';
    this.dialogOpt = data;
  }

  tableAction(event) {
    const name = event[0];
    const args = event.slice(1);
    if (this[name]) { this[name](...args); }
  }

}
