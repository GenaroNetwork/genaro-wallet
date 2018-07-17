import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
const LANGS = ["en", "zh"];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public electronService: ElectronService,
    private i18n: TranslateService) {
    this.i18n.addLangs(LANGS);
    this.i18n.setDefaultLang('en');
    console.log(this.i18n.getBrowserLang());

    if (electronService.isElectron()) {
    } else {
      console.log('Mode web');
    }
  }
}
