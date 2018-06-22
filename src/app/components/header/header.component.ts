import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  menus: any[] = [];

  currentAccount: string;

  selected(...params) {
    console.log(...params);
  }

  constructor(private i18n: TranslateService) { }

  ngOnInit() {
    setTimeout(() => {
      this.currentAccount = this.i18n.instant("HEADER.NO_ACCOUNT");
      this.menus = [
        {
          value: "create-wallet",
          divided: true,
          label: this.i18n.instant("HEADER.CREATE_WALLET"),
        }, {
          value: "settings",
          label: this.i18n.instant("HEADER.SETTINGS"),
        }, {
          value: "help",
          label: this.i18n.instant("HEADER.HELP"),
        }, {
          value: "about",
          label: this.i18n.instant("HEADER.ABOUT"),
        }
      ];
    }, 0);
  }

}
