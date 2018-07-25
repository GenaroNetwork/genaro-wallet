import { Component, OnInit, ApplicationRef, OnDestroy } from '@angular/core';
import { EdenService } from '../../services/eden.service';
import { remote } from "electron";
import { WalletService } from '../../services/wallet.service';
import { TranslateService } from '../../../../node_modules/@ngx-translate/core';



@Component({
  selector: 'app-eden',
  templateUrl: './eden.component.html',
  styleUrls: ['./eden.component.scss']
})
export class EdenComponent implements OnInit, OnDestroy {
  constructor(
    public edenService: EdenService,
    public walletService: WalletService,
    private appRef: ApplicationRef,
    private i18n: TranslateService,
  ) {
  }
  edenDialogName: string = null;
  edenDialogOpt: any = null;
  fileSelected: Set<number> = new Set();
  lastFileSelected: number = null;
  selectedIncludeFolder: boolean = false;
  edenServiceSub = this.edenService.events.subscribe(value => {
    console.log(value)
    if (value === "refresh-done") this.clearSelect();
  })

  ngOnInit() {
    let env = this.edenService.allEnvs[this.walletService.wallets.current]
    if (!env)
      this.edenService.generateEnv("111111");
    else
      this.edenService.updateAll();
  }

  ngOnDestroy() {
    this.edenServiceSub.unsubscribe();
  }

  clearSelect() {
    this.fileSelected = new Set();
    this.lastFileSelected = null;
    this.selectedIncludeFolder = false;
  }

  mouseDown(event: MouseEvent, i: number) {
    event.stopPropagation();
    if (i === -1) {
      this.clearSelect();
    } else if (event.button !== 0) {
      if (this.fileSelected.has(i)) return;
      this.fileSelected = new Set();
      this.fileSelected.add(i);
      this.lastFileSelected = i;
    } else if (!event.ctrlKey && !event.shiftKey && !event.metaKey) {
      this.fileSelected.clear();
      this.fileSelected.add(i);
    } else if (event.shiftKey) {
      if (this.lastFileSelected === null) {
        this.fileSelected.add(i);
      } else {
        for (let j = Math.min(i, this.lastFileSelected); j <= Math.max(i, this.lastFileSelected); j++) {
          this.fileSelected.add(j);
        }
      }
    } else if (event.ctrlKey || event.metaKey) {
      if (this.fileSelected.has(i)) this.fileSelected.delete(i);
      else {
        this.fileSelected.add(i);
      }
    }
    this.selectedIncludeFolder = false;
    this.fileSelected.forEach(i => {
      if (this.edenService.currentView[i].type === "folder") this.selectedIncludeFolder = true;
    });
    this.lastFileSelected = i;
    this.appRef.tick();
  }

  dblclick(index: number) {
    let file = this.edenService.currentView[index];
    if (file.type !== "bucket" && file.type !== "folder") return;
    this.edenService.changePath(["/", file.name]);
    this.fileSelected = new Set();
    this.lastFileSelected = null;
  }

  rightClick(event: MouseEvent) {
    const menu = new remote.Menu();
    if (this.edenService.currentPath.length === 0) {
      if (this.fileSelected.size === 1) menu.append(new remote.MenuItem({
        label: this.i18n.instant("EDEN.OPEN"), click: this.openBucket.bind(this)
      }));
      menu.append(new remote.MenuItem({ label: this.i18n.instant("EDEN.CREATE_BUCKET"), click: this.createBucket.bind(this) }));
      if (this.fileSelected.size > 0) menu.append(new remote.MenuItem({ label: this.i18n.instant("EDEN.DELETE_BUCKET"), click: this.deleteBucket.bind(this) }));
    } else {
      if (this.fileSelected.size > 0) {
        menu.append(new remote.MenuItem({ label: this.i18n.instant("EDEN.DOWNLOAD_FILE"), click: this.downloadFile.bind(this) }));
        menu.append(new remote.MenuItem({ label: this.i18n.instant("EDEN.REMOVE_FILE"), click: this.removeFile.bind(this) }));
      }
      menu.append(new remote.MenuItem({ label: this.i18n.instant("EDEN.UPLOAD_FILE"), click: this.uploadFile.bind(this) }));
    }
    menu.popup({ window: remote.getCurrentWindow() });
  }
  private getCurrentFiles() {
    let files = [];
    this.fileSelected.forEach(i => {
      files.push(this.edenService.currentView[i]);
    });
    return files;
  }
  uploadFile() {
    this.edenService.fileUploadTask();
  }
  downloadFile() {
    this.edenService.fileDownloadTask(this.getCurrentFiles());
  }
  removeFile() {
    this.edenService.fileRemoveTask(this.getCurrentFiles());
  }
  createBucket() { }
  openBucket() {
    let i = this.fileSelected.values().next().value;
    let name = this.edenService.currentView[i].name;
    this.edenService.changePath([`/${name}`]);
    this.fileSelected = new Set();
    this.lastFileSelected = null;
  }
  deleteBucket() {
    let bucketList = [];
    this.fileSelected.forEach(i => {
      bucketList.push(this.edenService.currentView[i]);
    });
    this.edenDialogOpt = bucketList;
    this.edenDialogName = "edenDeleteBucket";
  }

  type2icon(type: string, rotate: boolean = false) {
    type = type.toLowerCase();
    let icon = "";
    switch (type) {
      case ".txt":
        icon = "file-text";
        break;
      case ".pdf":
        icon = "file-pdf";
        break;
      case ".doc":
      case ".docx":
      case ".pages":
        icon = "file-word";
        break;
      case ".xls":
      case ".xlsx":
      case ".numbers":
        icon = "file-excel";
        break;
      case ".ppt":
      case ".pptx":
      case ".keynote":
        icon = "file-ppt";
        break;
      case ".jpg":
      case ".jpeg":
      case ".png":
      case ".gif":
      case ".webp":
      case ".jpeg":
        icon = "file-jpg";
        break;
      case ".md":
      case ".markdown":
        icon = "file-markdown";
        break;
      case "bucket":
        icon = "hdd";
        break;
      case "folder":
        icon = "folder";
        break;
      case "file":
        icon = "file";
        break;
      case "add":
        icon = "add";
        break;
      default:
        icon = "file-unknown";
        break;
    }
    return `anticon anticon-${icon} ${rotate ? "anticon-spin" : ""}`;
  }

}
