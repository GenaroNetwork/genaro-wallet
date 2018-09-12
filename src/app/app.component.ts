import { Component, AfterViewChecked, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SettingService } from './services/setting.service';
import { nextTick } from 'q';
import { remote } from "electron";
import { EdenService } from './services/eden.service';
import { SharerService } from './services/sharer.service';
import { IpcService } from './services/ipc.service';
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
    private edenService: EdenService,
    private sharerService: SharerService,
  ) {

    this.i18n.addLangs(LANGS);
    remote.app.on("before-quit", event => {

      let notExitButton = this.i18n.instant("COMMON.DO_NOT_EXIT");
      let exitButton = this.i18n.instant("COMMON.EXIT");

      let exitMsg = "";
      if (this.sharerService.runningNodes > 0) {
        exitMsg = this.i18n.instant("COMMON.EXIT_MSG_SHARER");
      } else if (this.edenService.taskCount > 0) {
        exitMsg = this.i18n.instant("COMMON.EXIT_MSG_EDEN");
      } else {
        return;
      }
      console.log(event);
      // @ts-ignore
      let exit = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
        type: "question",
        buttons: [exitButton, notExitButton],
        title: this.i18n.instant("COMMON.EXIT_TITLE"),
        message: exitMsg,
      });
      if (exit === 0) return;
      event.stopPropagation()
      event.preventDefault();
      event.returnValue = false;
    });
  }

  ngAfterViewChecked() {
    if (this.currentLang === this.setting.language) return;
    if (this.i18n.instant("LANGUAGE_NAME") === "LANGUAGE_NAME") return;
    if (this.checkLang.nativeElement.innerHTML !== this.i18n.instant("LANGUAGE_NAME")) return;
    this.currentLang = this.setting.language;
    nextTick(() => {
      this.setting.languageRendered();
    });
  }
}
