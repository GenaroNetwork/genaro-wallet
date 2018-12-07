import { Component, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from './services/translate.service';
import { SettingService } from './services/setting.service';
import { DAPP_PAGE } from './libs/config';
import { shell } from 'electron';
const LANGS = ['en', 'zh'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewChecked {

  private currentLang: string = null;
  @ViewChild("checkLang") checkLang: ElementRef;

  constructor(
    private i18n: TranslateService,
    public setting: SettingService,
  ) { }

  ngAfterViewChecked() {
    if (this.currentLang === this.setting.language) return;
    if (this.i18n.instant("LANGUAGE_NAME") === "LANGUAGE_NAME") return;
    if (this.checkLang.nativeElement.innerHTML !== this.i18n.instant("LANGUAGE_NAME")) return;
    this.currentLang = this.setting.language;
  }

  openDappPage() {
    shell.openExternal(DAPP_PAGE);
  }
}
