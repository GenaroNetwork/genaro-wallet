import { Injectable, ApplicationRef } from '@angular/core';
import { Environment } from "libgenaro";
import { WalletService } from './wallet.service';
import { BRIDGE_API_URL } from '../libs/config';
import { NzMessageService } from '../../../node_modules/ng-zorro-antd';
import { TranslateService } from '../../../node_modules/@ngx-translate/core';
import { IpcService } from './ipc.service';
import { BehaviorSubject } from '../../../node_modules/rxjs';

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
  loading: boolean = false;

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
    this.loading = true;
    let env = this.allEnvs[this.walletService.wallets.current];
    if (this.currentPath.length === 0) this.updateBuckets(env);
    else this.updateFiles(env);
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
      this.updateView();
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
    this.loading = false;
    console.log(this.loading);
    this.appRef.tick();
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


  // transactionId TEXT,
  // txType TEXT,
  // addrFrom TEXT,
  // addrTo TEXT,
  // amount REAL,
  // data TEXT,
  // gasPrice REAL,
  // gasLimit INTEGER,
  // created NUMERIC,
  // state INTEGER,
  // message TEXT,
  // hash TEXT,
  // error TEXT,
  // receipt TEXT
  private newTask(type: "UPLOAD_FILE" | "DOWNLOAD_FILE") {

  }

}
