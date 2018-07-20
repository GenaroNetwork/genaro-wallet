import { Component, OnInit } from '@angular/core';
import { EdenService } from '../../services/eden.service';
import { remote } from "electron";

@Component({
  selector: 'app-eden',
  templateUrl: './eden.component.html',
  styleUrls: ['./eden.component.scss']
})
export class EdenComponent implements OnInit {
  constructor(
    public edenService: EdenService,
  ) {
  }
  fileSelected: number[] = []


  ngOnInit() {
    this.edenService.generateEnv("111111");;
    //this.edenService.updateAll();
  }

  click(i) {
    console.log("click", i);
  }

  dblclick() {
    console.log("dblclick");
  }

  rightClick(event: MouseEvent) {
    event.stopPropagation();

    const menu = new remote.Menu()
    menu.append(new remote.MenuItem({ label: '删除', click() { console.log('item 1 clicked') } }))
    menu.append(new remote.MenuItem({ label: '复制', click() { console.log('item 1 clicked') } }))
    menu.append(new remote.MenuItem({ label: '打开', click() { console.log('item 1 clicked') } }))
    menu.popup({ window: remote.getCurrentWindow() })
    console.log(event);
  }

  type2icon(type: string, rotate: boolean = false) {
    type = type.toLowerCase();
    let icon = "";
    switch (type) {
      case ".txt":
        icon = "text";
        break;
      case ".pdf":
        icon = "pdf";
        break;
      case ".doc":
      case ".docx":
      case ".pages":
        icon = "word";
        break;
      case ".xls":
      case ".xlsx":
      case ".numbers":
        icon = "excel";
        break;
      case ".ppt":
      case ".pptx":
      case ".keynote":
        icon = "ppt";
        break;
      case ".jpg":
      case ".jpeg":
      case ".png":
      case ".gif":
      case ".webp":
      case ".jpeg":
        icon = "jpg";
        break;
      case ".md":
      case ".markdown":
        icon = "markdown";
        break;
      case "bucket":
        icon = "hdd";
        break;
      case "folder":
        icon = "ppt";
        break;
      case "file":
        icon = "file";
        break;
      case "add":
        icon = "add";
        break;
      default:
        icon = "unknown";
        break;
    }
    return `anticon anticon-${icon} ${rotate ? "anticon-spin" : ""}`;
  }

}
