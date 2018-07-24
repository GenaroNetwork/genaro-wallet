import { Component, OnInit, ApplicationRef } from '@angular/core';
import { EdenService } from '../../services/eden.service';
import { remote } from "electron";
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-eden',
  templateUrl: './eden.component.html',
  styleUrls: ['./eden.component.scss']
})
export class EdenComponent implements OnInit {
  constructor(
    public edenService: EdenService,
    public walletService: WalletService,
    private appRef: ApplicationRef,
  ) {
  }
  fileSelected: Set<number> = new Set();
  lastFileSelected: number = null;

  ngOnInit() {
    let env = this.edenService.allEnvs[this.walletService.wallets.current]
    if (!env)
      this.edenService.generateEnv("111111");
    else
      this.edenService.updateAll();
  }

  mouseDown(event: MouseEvent, i: number) {
    event.stopPropagation();
    if (i === -1) {
      this.fileSelected = new Set();
      this.lastFileSelected = null;
      return;
    }
    if (!event.ctrlKey && !event.shiftKey && !event.metaKey) {
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
      else this.fileSelected.add(i);
    }
    this.lastFileSelected = i;
    this.appRef.tick();
  }

  dblclick(name: string, type: string) {
    if (type !== "bucket" && type !== "folder") return;
    this.edenService.changePath(["/", name]);
    this.fileSelected = new Set();
    this.lastFileSelected = null;
  }

  rightClick(event: MouseEvent) {
    const menu = new remote.Menu()
    menu.append(new remote.MenuItem({ label: '删除', click() { console.log('item 1 clicked') } }))
    menu.append(new remote.MenuItem({ label: '复制', click() { console.log('item 1 clicked') } }))
    menu.append(new remote.MenuItem({ label: '打开', click() { console.log('item 1 clicked') } }))
    menu.popup({ window: remote.getCurrentWindow() });
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
