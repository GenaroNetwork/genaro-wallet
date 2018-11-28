import { Component, OnInit, NgZone, OnDestroy, ElementRef } from '@angular/core';
import { EdenService } from '../../services/eden.service';
import { remote } from 'electron';
import { WalletService } from '../../services/wallet.service';
import { TranslateService } from '../../services/translate.service';
import { ActivatedRoute } from '@angular/router';
import { TxEdenService } from '../../services/txEden.service';
import { NickService } from '../../services/nick.service';
import { SettingService } from '../../services/setting.service';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-eden',
  templateUrl: './eden.component.html',
  styleUrls: ['./eden.component.scss']
})
export class EdenComponent implements OnInit, OnDestroy {
  constructor(
    public el: ElementRef,
    public edenService: EdenService,
    private txEdenService: TxEdenService,
    public walletService: WalletService,
    private i18n: TranslateService,
    private route: ActivatedRoute,
    private alert: NzMessageService,
    public settingService: SettingService,
    public nickService: NickService,
  ) {
  }
  edenDialogName: string = null;
  edenDialogOpt: any = null;
  fileSelected: Set<number> = new Set();
  lastFileSelected: number = null;
  selectedIncludeFolder = false;
  zone: NgZone;
  walletSub: any;
  mailSub: any;
  mailPath: string = '';
  mails: any[] = [];

  ngOnInit() {
    if (this.settingService.appType === 'gmail') {
      this.mailPath = 'mail';
      if(this.edenService.currentPathId && this.edenService.currentPathId.length > 0) {
        let pathId = this.edenService.currentPathId[this.edenService.currentPathId.length - 1];
        if (pathId === this.edenService.mail.inbox) {
          this.mailPath = 'inbox';
        }
        else if (pathId === this.edenService.mail.outbox) {
          this.mailPath = 'outbox';
        }
        else if (pathId) {
          this.mailPath = '';
        }
      }
    }
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
    if (this.walletSub) {
      this.walletSub.unsubscribe();
    }
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
    this.mailPath = '';
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

  setInbox() {
    const i = this.fileSelected.values().next().value;
    const id = this.edenService.currentView[i].id;
    this.edenDialogName = 'setInbox';
    this.edenDialogOpt = id;
  }

  setOutbox() {
    const i = this.fileSelected.values().next().value;
    const id = this.edenService.currentView[i].id;
    this.edenDialogName = 'setOutbox';
    this.edenDialogOpt = id;
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
    if (this.settingService.appType === 'gmail') {
      this.mailPath = 'mail';
    }
    else {
      this.mailPath = '';
    }
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

  openInbox() {
    // to
    this.mailPath = "inbox";
    this.edenService.changePath(["/", this.edenService.mail.inbox]);
    //this.mails = (this.txEdenService.mailList || {}).to;
  }

  openOutbox() {
    // from 
    this.mailPath = "outbox";
    this.edenService.changePath(["/", this.edenService.mail.outbox]);
    //this.mails = (this.txEdenService.mailList || {}).from;
  }

  sendMessage() {
    this.edenDialogName = "sendMessage";
    this.edenDialogOpt = this.edenService.mail.outbox;
  }

  showMessage(data) {
    this.edenDialogName = "openMessage";
    let file = this.getFileByShare(data);
    if (!file) {
      this.alert.error("未找到邮件");
      return;
    }
    let mailId = file.name.substr(2, 13);
    let allAttaches = this.mailPath === "inbox" ? this.txEdenService.mailList.toAttaches : this.txEdenService.mailList.fromAttaches;
    let attaches = allAttaches[mailId];
    this.edenDialogOpt = {
      file: file,
      bucketId: this.edenService.currentPathId[0],
      attaches,
    };
  }

  signInMessage(data) {
    let attaches = this.txEdenService.mailList.toAttaches[data.mailId];
    this.edenDialogOpt = {
      mail: data,
      attaches,
    }
    this.edenDialogName = "signInMessage";
  }

  deleteMessage(data) {
    this.edenDialogName = "deleteMessage";
    let file = this.getFileByShare(data);
    this.edenDialogOpt = {
      fileId: file ? file.id : '',
      shareId: data._id
    };
  }

  getFileByShare(share) {
    const { bucketEntryId, key, ctr } = share;
    let file;
    for (let i = 0, length = this.edenService.currentFiles.length; i < length; i++) {
      let f = this.edenService.currentFiles[i];
      if (f.id === bucketEntryId) {
        file = f;
        break;
      }
      if (f.rsaKey === key && f.rsaCtr == ctr) {
        file = f;
        break;
      }
    }
    return file;
  }

  changeMailPath() {
    if (this.settingService.appType === 'gmail') {
      this.mailPath = 'mail';
    }
    else {
      this.mailPath = '';
    }
  }

}
