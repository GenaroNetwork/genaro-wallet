import { Injectable, ApplicationRef } from '@angular/core';
import { Environment } from "libgenaro";
import { WalletService } from './wallet.service';
import { BRIDGE_API_URL, TASK_STATE, TASK_TYPE } from '../libs/config';
import { NzMessageService } from '../../../node_modules/ng-zorro-antd';
import { TranslateService } from '../../../node_modules/@ngx-translate/core';
import { IpcService } from './ipc.service';
import { v1 as uuidv1 } from "uuid";
import { remote } from "electron";
import { basename, join } from "path";
import { Subject } from '../../../node_modules/rxjs';
// &#47; => 正斜杠 

@Injectable({
  providedIn: 'root'
})
export class EdenService {

  allEnvs: any = {};
  requestEnv: boolean = false;
  currentBuckets: any = [];
  currentFiles: any = [];
  private fs: any = [];
  private allView: any[] = [];
  currentView: any = [];
  currentPath: string[] = [];
  currentPage = {
    count: 0,
    pageSize: Infinity,
    page: 1,
  }
  tasks: any[] = [];
  events: Subject<any> = new Subject;

  constructor(
    private walletService: WalletService,
    private messageService: NzMessageService,
    private i18n: TranslateService,
    private appRef: ApplicationRef,
    private ipc: IpcService,
  ) {
    this.walletService.currentWallet.subscribe(wallet => {
      if (!wallet) return;
      this.updateAll();
      this.loadTask();
    });
  }

  generateEnv(password: string) {
    let address = this.walletService.wallets.current;
    let json = this.walletService.getJson(address);
    let env;
    try {
      env = new Environment({
        bridgeUrl: BRIDGE_API_URL,
        keyFile: json,
        passphrase: password,
      });
    } catch (e) {
      if (e.message.indexOf("passphrase mismatch") > -1) {
        this.messageService.error(this.i18n.instant("ERROR.PASSWORD"));
      }
      return false;
    }
    this.allEnvs[address] = env;
    this.requestEnv = false;
    this.changePath(["/"]);
  }

  updateAll() {
    let env = this.allEnvs[this.walletService.wallets.current];
    this.updateBuckets(env);
    if (this.currentPath.length !== 0) this.updateFiles(env);
  }

  updateBuckets(env) {
    if (!env) {
      this.requestEnv = true;
      return;
    }
    env.getBuckets((err, result) => {
      if (err) throw new Error(err);
      this.currentBuckets = [];
      result.forEach(bucket => {
        this.currentBuckets.push({
          id: bucket.id,
          name: bucket.name,
          created: bucket.created,
        });
      });
      if (this.currentPath.length === 0) this.updateView();
    });
  }

  updateFiles(env) {
    if (!env) {
      this.requestEnv = true;
      return;
    }
    if (this.currentPath.length === 0) {
      throw new Error("请先选择一个bucket");
    }
    let bucket = this.currentBuckets.find(bucket => bucket.name === this.currentPath[0]);
    if (!bucket) throw Error("没有bucket");
    let bucketId = bucket.id;
    env.listFiles(bucketId, ((err, files) => {
      if (err) throw new Error(err);
      this.currentFiles = [];
      files.forEach(file => {
        this.currentFiles.push({
          id: file.id,
          name: file.filename,
          mime: file.minetype,
          size: file.size,
          created: file.created,
        });
      });
      this.updateView();
    }));
  }

  private newFs(files: any) {
    let fs: any = [];
    files.forEach(file => {

    });
  };
  private getFs(path: string[]) {

  };

  updateView(reload: boolean = true) {
    if (reload) {
      this.allView = [];
      if (this.currentPath.length === 0) {
        this.currentBuckets.forEach(bucket => {
          let file = Object.assign({}, bucket);
          file.type = "bucket";
          this.allView.push(file);
        });
      } else {
        let startsWith = this.currentPath.slice(1).join("/");
        let currentFolder = this.currentFiles.filter(file => file.name.startsWith(startsWith));
        currentFolder.forEach(file => {
          file = Object.assign({}, file);
          let name: string = file.name;
          if (name.endsWith("/")) {
            file.type = "folder";
          } else if (name.indexOf(".") === -1) {
            file.type = "file";
          } else {
            let extName = name.split(".");
            file.type = extName.pop();
          }
          this.allView.push(file);
        });
      }
    }
    this.currentPage.count = this.allView.length;
    let pageStart = (this.currentPage.page - 1) * this.currentPage.pageSize;
    let pageEnd = this.currentPage.page * this.currentPage.pageSize;
    this.currentView = this.allView.slice(pageStart, pageEnd);
    this.events.next("refresh-done");
    this.appRef.tick();
    this.events.next("refresh-tock");
  }
  changePath(path: string[]) {
    let currentPath = this.currentPath;
    path.forEach(now => {
      if (now === "/") {
        currentPath = [];
      } else if (now.startsWith("/")) {
        currentPath = [now.substr(1)];
      } else if (now === ".." || now === "../") {
        currentPath.pop();
      } else if (now.startsWith("../")) {
        currentPath.pop();
        currentPath.push(now.substr(3));
      } else if (now === "." || now === "./") {
        return;
      } else if (now.startsWith("./")) {
        currentPath.push(now.substr(2));
      } else {
        currentPath.push(now);
      }
    });
    this.currentPath = currentPath;
    this.updateAll();
  }

  private async loadTask() {
    this.tasks = await this.ipc.dbAll("task", "SELECT * FROM task");
  }

  private updateTask() {
    this.newTask(TASK_TYPE.FILE_DOWNLOAD, {})
  }

  private newTask(type: TASK_TYPE, obj: any) {
    let id = uuidv1();
    let insert = `
    (id, bucketId, bucketName, fileId, fileName, nativePath, env, created, updated, process, state, type, doneBytes, allBytes, error)
    VALUES
    ('${id}', '${obj.bucketId}', '${obj.bucketName}', '${obj.fileId}', '${obj.fileName}', '${obj.nativePath}'
    , '${obj.env}', '${Date.now()}', '${Date.now()}', 0, '${TASK_STATE.INIT}', '${type}', 0, ${obj.allBytes}, NULL)`;
  }

  private convertChar(html: string, encode: boolean = true) {
    enum chars {
      "/" = "&#47;",
      "<" = "&lt;",
      ">" = "&gt;",
    };
    Object.keys(chars).forEach(key => {
      if (encode) html = html.replace(key, chars[key]);
      else html = html.replace(chars[key], key);
    });
    return html;
  }

  private runAll(arr: any[], func: Function, reload: boolean = true) {
    let address = this.walletService.wallets.current;
    let env = this.allEnvs[address];
    return new Promise((res, rej) => {
      let times = 0;
      arr.forEach(item => {
        func(item, env, () => {
          if (++times < arr.length) return;
          if (reload) this.updateAll();
          res();
        });
      });
    });
  }

  fileTask() { }

  fileUploadTask() {
    let path = Array.from(this.currentPath);
    let bucketName = path.shift();
    let bucketId = this.currentBuckets.find(bucket => bucket.name === bucketName).id;
    let nativePaths = remote.dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"]
    });
    if (!nativePaths) return;
    this.runAll(nativePaths, (path, env, cb) => {
      env.storeFile(bucketId, path, {
        filename: basename(path),
        progressCallback: (...params) => { },
        finishedCallback: cb,
      });
    }).then(() => {
      this.messageService.success(this.i18n.instant("EDEN.UPLOAD_FILE_DONE"))
    });
  }

  fileDownloadTask(files: any | any[]) {
    if (!(files instanceof Array)) {
      files = [files];
    }
    let nativePath;
    if (files.length === 1) nativePath = remote.dialog.showSaveDialog({});
    else nativePath = remote.dialog.showOpenDialog({ properties: ["openDirectory", "createDirectory"] });
    if (!nativePath) return;
    let path = Array.from(this.currentPath);
    let bucketName = path.shift();
    let bucketId = this.currentBuckets.find(bucket => bucket.name === bucketName).id;
    this.runAll(files, (file, env, cb) => {
      let filePath = nativePath;
      if (files.length > 1) filePath = join(nativePath[0], file.name);
      env.resolveFile(bucketId, file.id, filePath, {
        overwrite: true,
        progressCallback: (...params) => { },
        finishedCallback: cb,
      });
    }, false).then(() => {
      this.messageService.success(this.i18n.instant("EDEN.DOWNLOAD_FILE_DONE"))
    });
  }

  fileRemoveTask(files: any[]) {
    let path = Array.from(this.currentPath);
    let bucketName = path.shift();
    let bucketId = this.currentBuckets.find(bucket => bucket.name === bucketName).id;
    this.runAll(files, (file, env, cb) => {
      env.deleteFile(bucketId, file.id, cb);
    }).then(() => {
      this.messageService.success(this.i18n.instant("EDEN.REMOVE_FILE_DONE"))
    });
  }

  bucketCreateTask(bucketName: string) {
    if (this.currentBuckets.find(bucket => bucket.name === bucketName)) {
      this.messageService.error(this.i18n.instant("EDEN.CREATE_BUCKET_EXISTS"))
      return;
    }
    this.runAll([bucketName], (bucketName, env, cb) => {
      bucketName = this.convertChar(bucketName, true);
      env.createBucket(bucketName, cb);
    }).then(() => {
      this.messageService.success(this.i18n.instant("EDEN.CREATE_BUCKET_DONE"))
    });
  }

  bucketDeleteTask(buckets: any[]) {
    this.runAll(buckets, (bucket, env, cb) => {
      env.deleteBucket(bucket.id, cb);
    }).then(() => {
      this.messageService.success(this.i18n.instant("EDEN.DELETE_BUCKET_DONE"))
    });
  }
}
