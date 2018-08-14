import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingService } from './services/setting.service';
const LANGS = ['en', 'zh'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private i18n: TranslateService,
    private setting: SettingService,
  ) {
    this.i18n.addLangs(LANGS);
    this.setting.doNothing();
  }
}
