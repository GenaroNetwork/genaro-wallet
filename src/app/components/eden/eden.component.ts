import { Component, OnInit, NgZone, OnDestroy } from '@angular/core';
import { EdenService } from '../../services/eden.service';
import { remote } from 'electron';
import { WalletService } from '../../services/wallet.service';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { TxEdenService } from '../../services/txEden.service';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-eden',
  templateUrl: './eden.component.html',
  styleUrls: ['./eden.component.scss']
})
export class EdenComponent implements OnInit, OnDestroy {
  constructor(
    public edenService: EdenService,
    private txEdenService: TxEdenService,
    public walletService: WalletService,
    private i18n: TranslateService,
    private route: ActivatedRoute,
    private alert: NzMessageService,
  ) {
  }
  edenDialogName: string = null;
  edenDialogOpt: any = null;
  fileSelected: Set<number> = new Set();
  lastFileSelected: number = null;
  selectedIncludeFolder = false;
  zone: NgZone;
  walletSub: any;

  ngOnInit() {
    this.edenService.updateAll();
    // let env = this.edenService.allEnvs[this.walletService.wallets.current]
    // if (!env)
    //   this.edenService.generateEnv("111111");
    // else
    //   this.edenService.updateAll();
    const path = this.route.snapshot.params.path;
    if (path) {
      const pathArr = path.split('/');
      pathArr.unshift('/');
      this.edenService.changePath(pathArr);
    }
    this.walletSub = this.walletService.currentWallet.subscribe(async () => {
      this.txEdenService.clearAllSig();
      await this.txEdenService.getAll(true);
      await this.edenService.updateAll([]);
    });
  }

  ngOnDestroy() {
    this.walletSub.unsubscribe();
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
      this.lastFileSelected = null;
      return;
    }
    if (event.button !== 0) {
      if (this.fileSelected.has(i)) { return; }
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
      if (this.fileSelected.has(i)) { this.fileSelected.delete(i); } else {
        this.fileSelected.add(i);
      }
    }
    this.selectedIncludeFolder = false;
    this.fileSelected.forEach(i => {
      if (this.edenService.currentView[i].type === 'folder') { this.selectedIncludeFolder = true; }
    });
    this.lastFileSelected = i;
  }

  dblclick(index: number) {
    const file = this.edenService.currentView[index];
    if (file.type !== 'bucket' && file.type !== 'folder') { return; }
    this.edenService.changePath(['/', file.id]);
    this.fileSelected = new Set();
    this.lastFileSelected = null;
  }

  rightClick(event: MouseEvent) {
    const menu = new remote.Menu();
    if (this.edenService.currentPath.length === 0) {
      if (this.fileSelected.size === 1) {
        menu.append(new remote.MenuItem({
          label: this.i18n.instant('EDEN.OPEN'), click: this.openBucket.bind(this)
        }));
      }
      menu.append(new remote.MenuItem({ label: this.i18n.instant('TXEDEN.BUY_SPACE'), click: this.createBucket.bind(this) }));
      if (this.fileSelected.size === 1) menu.append(new remote.MenuItem({ label: this.i18n.instant('EDEN.RENAME_BUCKET'), click: this.renameBucket.bind(this) }));
      if (this.fileSelected.size > 0) { menu.append(new remote.MenuItem({ label: this.i18n.instant('EDEN.DELETE_BUCKET'), click: this.deleteBucket.bind(this) })); }
    } else {
      if (this.fileSelected.size === 0) {
        menu.append(new remote.MenuItem({ label: this.i18n.instant('EDEN.UPLOAD_FILE'), click: this.uploadFile.bind(this) }));
      } else {
        menu.append(new remote.MenuItem({ label: this.i18n.instant('EDEN.DOWNLOAD_FILE'), click: this.downloadFile.bind(this) }));
        menu.append(new remote.MenuItem({ label: this.i18n.instant('EDEN.REMOVE_FILE'), click: this.removeFile.bind(this) }));
      }
    }
    menu.popup({ window: remote.getCurrentWindow() });
  }
  private getCurrentFiles() {
    const files = [];
    this.fileSelected.forEach(i => {
      files.push(this.edenService.currentView[i]);
    });
    return files;
  }
  createBucket() {
    this.edenDialogName = 'buySpace';
  }
  renameBucket() {
    this.edenDialogOpt = this.fileSelected;
    this.edenDialogName = 'edenRenameBucket';
  }
  uploadFile() {
    this.edenService.fileUploadTask();
  }
  async downloadFile() {
    await this.txEdenService.getAll()
    let user = this.txEdenService.currentUser;
    let used = user.usedDownloadBytes || 0;
    let all = user.limitBytes || 0;
    this.edenService.fileDownloadTask(this.getCurrentFiles(), all - used);
  }
  removeFile() {
    let files = this.getCurrentFiles();
    this.edenDialogOpt = files;
    this.edenDialogName = 'edenDeleteFiles';
  }

  shareFile() {
    let selectedFiles = this.getCurrentFiles();
    let shareFile;
    if (selectedFiles && selectedFiles.length > 0) {
      shareFile = selectedFiles[0];
    }
    if (!shareFile) {
      return this.alert.error(this.i18n.instant('ERROR.SELECT_FILE'));
    }
    else if (!shareFile.rsaKey || !shareFile.rsaCtr) {
      return this.alert.error(this.i18n.instant('ERROR.FILE_CANNOT_SHARE'));
    }
    this.edenDialogOpt = shareFile;
    this.edenDialogName = 'shareFile';
  }

  openBucket() {
    const i = this.fileSelected.values().next().value;
    const id = this.edenService.currentView[i].id;
    this.edenService.changePath([`/${id}`]);
    this.fileSelected = new Set();
    this.lastFileSelected = null;
  }

  deleteBucket() {
    const bucketList = [];
    this.fileSelected.forEach(i => {
      bucketList.push(this.edenService.currentView[i]);
    });
    this.edenDialogOpt = bucketList;
    this.edenDialogName = 'edenDeleteBucket';
  }

  type2icon(type: string) {
    type = type.toLowerCase();
    let icon = '';
    switch (type) {
      case '.txt':
        icon = 'file-text';
        break;
      case '.pdf':
        icon = 'file-pdf';
        break;
      case '.doc':
      case '.docx':
      case '.pages':
        icon = 'file-word';
        break;
      case '.xls':
      case '.xlsx':
      case '.numbers':
        icon = 'file-excel';
        break;
      case '.ppt':
      case '.pptx':
      case '.keynote':
        icon = 'file-ppt';
        break;
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
      case '.webp':
      case '.jpeg':
        icon = 'file-jpg';
        break;
      case '.md':
      case '.markdown':
        icon = 'file-markdown';
        break;
      case 'bucket':
        icon = 'hdd';
        break;
      case 'folder':
        icon = 'folder';
        break;
      case 'file':
        icon = 'file';
        break;
      case 'add':
        icon = 'add';
        break;
      default:
        icon = 'file-unknown';
        break;
    }
    return `${icon}`;
  }

}
