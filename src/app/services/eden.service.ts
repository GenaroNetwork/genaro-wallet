import { Injectable, NgZone } from '@angular/core';
import { Environment } from 'libgenaro';
import { WalletService } from './wallet.service';
import { BRIDGE_API_URL, TASK_STATE, TASK_TYPE } from '../libs/config';
import { NzMessageService } from 'ng-zorro-antd';
import { TranslateService } from '@ngx-translate/core';
import { IpcService } from './ipc.service';
import { v1 as uuidv1 } from 'uuid';
import { remote } from 'electron';
import { basename, join } from 'path';
import { TransactionService } from './transaction.service';
// &#47; => 正斜杠

@Injectable({
  providedIn: 'root'
})
export class EdenService {

  allEnvs: any = {};
  requestEnv: boolean = null;
  currentBuckets: any = [];
  currentFiles: any = [];
  private fs: any = [];
  private allView: any[] = [];
  currentView: any = [];
  currentPath: string[] = [];
  currentPathId: string[] = [];
  currentPage = {
    count: 0,
    pageSize: Infinity,
    page: 1,
  };
  tasks: any[] = [];

  constructor(
    private walletService: WalletService,
    private messageService: NzMessageService,
    private i18n: TranslateService,
    private ipc: IpcService,
    private zone: NgZone,
    private txService: TransactionService,
  ) {
    this.walletService.currentWallet.subscribe(wallet => {
      if (!wallet) { return; }
      this.updateAll();
      this.loadTask();
    });

    this.txService.newBlockHeaders.subscribe(() => {
      if (this.currentPath.length === 0) this.updateAll();
    });
  }

  generateEnv(password: string) {
    const address = this.walletService.wallets.current;
    const json = this.walletService.getJson(address);
    let env;
    try {
      env = new Environment({
        bridgeUrl: BRIDGE_API_URL,
        keyFile: json,
        passphrase: password,
      });
    } catch (e) {
      if (e.message.indexOf('passphrase mismatch') > -1) {
        this.messageService.error(this.i18n.instant('ERROR.PASSWORD'));
      }
      return false;
    }
    this.allEnvs[address] = env;
    this.requestEnv = false;
    this.changePath(['/']);
  }

  updateAll() {
    const env = this.allEnvs[this.walletService.wallets.current];
    this.updateBuckets(env);
    if (this.currentPath.length !== 0) { this.updateFiles(env); }
  }

  updateBuckets(env) {
    if (!env) {
      this.requestEnv = true;
      return;
    }
    env.getBuckets((err, result) => {
      if (err) { throw new Error(err); }
      this.currentBuckets = [];
      result.forEach(bucket => {
        this.currentBuckets.push({
          id: bucket.id,
          name: bucket.name,
          created: bucket.created,
          bucketUsedStorage: bucket.usedStorage || 0,
          bucketLimitStorage: bucket.limitStorage || 0,
        });
      });
      if (this.currentPath.length === 0) { this.updateView(); }
    });
  }

  updateFiles(env) {
    if (!env) {
      this.requestEnv = true;
      return;
    }
    if (this.currentPath.length === 0) {
      throw new Error('请先选择一个bucket');
    }
    const bucket = this.currentBuckets.find(bucket => bucket.name === this.currentPath[0]);
    if (!bucket) { throw Error('没有bucket'); }
    const bucketId = bucket.id;
    env.listFiles(bucketId, ((err, files) => {
      if (err) { throw new Error(err); }
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
    const fs: any = [];
    files.forEach(file => {

    });
  }
  private getFs(path: string[]) {

  }

  updateView(reload: boolean = true) {
    if (reload) {
      this.allView = [];
      if (this.currentPath.length === 0) {
        this.currentBuckets.forEach(bucket => {
          const file = Object.assign({}, bucket);
          file.type = 'bucket';
          this.allView.push(file);
        });
      } else {
        const startsWith = this.currentPath.slice(1).join('/');
        const currentFolder = this.currentFiles.filter(file => file.name.startsWith(startsWith));
        currentFolder.forEach(file => {
          file = Object.assign({}, file);
          const name: string = file.name;
          if (name.endsWith('/')) {
            file.type = 'folder';
          } else if (name.indexOf('.') === -1) {
            file.type = 'file';
          } else {
            const extName = name.split('.');
            file.type = `.${extName.pop()}`;
          }
          this.allView.push(file);
        });
      }
    }
    this.zone.run(() => {
      this.currentPage.count = this.allView.length;
      const pageStart = (this.currentPage.page - 1) * this.currentPage.pageSize;
      const pageEnd = this.currentPage.page * this.currentPage.pageSize;
      this.currentView = this.allView.slice(pageStart, pageEnd);
    });
  }

  changePath(path: string[]) {
    let currentPathId = this.currentPathId;
    path.forEach(now => {
      if (now === '/') {
        currentPathId = [];
      } else if (now.startsWith('/')) {
        currentPathId = [now.substr(1)];
      } else if (now === '..' || now === '../') {
        currentPathId.pop();
      } else if (now.startsWith('../')) {
        currentPathId.pop();
        currentPathId.push(now.substr(3));
      } else if (now === '.' || now === './') {
        return;
      } else if (now.startsWith('./')) {
        currentPathId.push(now.substr(2));
      } else {
        currentPathId.push(now);
      }
    });
    this.currentPathId = currentPathId;
    this.currentPath = this.currentPathId.map((id, index) => {
      if (index === 0) { return this.currentBuckets.find(bucket => bucket.id === id).name; } else {
        let filename = this.currentFiles.find(file => file.id === id);
        if (filename.endsWith('/')) { filename = filename.substr(0, filename.length - 1); }
        return filename;
      }
    });
    this.updateAll();
  }

  bucketRename(id: string, newName: string) {
    return new Promise((res, rej) => {
      const address = this.walletService.wallets.current;
      const env = this.allEnvs[address];
      env.renameBucket(id, newName, (err, result) => {
        if (err) {
          rej(err);
          console.log(err);
          return;
        }
        this.updateAll();
        res();
      });
    });
  }

  private async loadTask() {
    const tasks = await this.ipc.dbAll('task', `SELECT * FROM task WHERE wallet='${this.walletService.wallets.current}'`);
    this.zone.run(() => {
      this.tasks = tasks;
    });
  }

  private async newTask(type: TASK_TYPE, obj: any) {
    const id = uuidv1();
    const insert = `
    (id, wallet, bucketId, bucketName, fileId, fileName, onlinePath, nativePath, env, created, updated, process, state, type, doneBytes, allBytes, error)
    VALUES
    ('${id}', '${this.walletService.wallets.current}','${obj.bucketId}', '${obj.bucketName}', '${obj.fileId}', '${obj.fileName}', '${this.currentPathId.join('/')}', '${obj.nativePath}'
    , '${JSON.stringify(obj.env)}', '${Date.now()}', '${Date.now()}', 0, '${TASK_STATE.INIT}', '${type}', 0, ${obj.allBytes}, NULL)`;
    await this.ipc.dbRun('task', `INSERT INTO task ${insert}`);
    this.loadTask();
    return id;
  }

  private async updateTask(id: string, obj: any) {
    const updateArr = [];
    for (const key in obj) {
      updateArr.push(`${key}='${obj[key]}'`);
    }
    if (!updateArr.length) { return; }
    const update = updateArr.join(',');
    await this.ipc.dbRun('task', `UPDATE task SET ${update} WHERE id='${id}'`);
    await this.loadTask();
  }

  private convertChar(html: string, encode: boolean = true) {
    enum chars {
      '/' = '&#47;',
      '<' = '&lt;',
      '>' = '&gt;',
    }
    Object.keys(chars).forEach(key => {
      if (encode) { html = html.replace(key, chars[key]); } else { html = html.replace(chars[key], key); }
    });
    return html;
  }

  private runAll(arr: any[], func: Function, reload: boolean = true) {
    const address = this.walletService.wallets.current;
    const env = this.allEnvs[address];
    if (!env) {
      this.requestEnv = true;
      throw new Error('no env');
    }
    return new Promise((res, rej) => {
      let times = 0;
      let errCount = 0;
      arr.forEach(item => {
        func(item, env, (err: boolean = false) => {
          if (err) { errCount++; }
          if (++times < arr.length) { return; }
          if (reload) { this.updateAll(); }
          res(errCount);
        });
      });
    });
  }

  fileUploadTask() {
    const path = Array.from(this.currentPath);
    const bucketName = path.shift();
    let folderPrefix = path.join('/');
    if (folderPrefix.length > 0) { folderPrefix += '/'; }
    const bucketId = this.currentBuckets.find(bucket => bucket.name === bucketName).id;
    const nativePaths = remote.dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections']
    });
    if (!nativePaths) { return; }
    this.runAll(nativePaths, async (path, env, cb) => {
      let filename = basename(path);
      filename = this.convertChar(filename, true);
      filename = folderPrefix + filename;
      let taskId = null;
      const taskEnv = env.storeFile(bucketId, path, {
        filename,
        progressCallback: (process, doneBytes, allBytes) => {
          if (!taskId) { return; }
          this.updateTask(taskId, {
            process, doneBytes, allBytes,
            state: TASK_STATE.INPROCESS,
          });
        },
        finishedCallback: (err, fileId) => {
          if (err) {
            console.log(err);
            this.updateTask(taskId, {
              state: TASK_STATE.ERROR,
            });
            cb(true);
          } else {
            if (!taskId) { return; }
            this.updateTask(taskId, {
              fileId,
              state: TASK_STATE.DONE,
            });
            cb();
          }
        },
      });
      taskId = await this.newTask(TASK_TYPE.FILE_UPLOAD, {
        bucketId, bucketName, fileId: null, fileName: filename, nativePath: path, env: taskEnv, allBytes: null,
      });
    }).then(errCount => {
      if (errCount === nativePaths.length) {
        this.messageService.error(this.i18n.instant('EDEN.UPLOAD_FILE_ERROR_ALL'));
      } else if (errCount) {
        this.messageService.warning(this.i18n.instant('EDEN.UPLOAD_FILE_ERROR', { errCount }));
      } else {
        this.messageService.success(this.i18n.instant('EDEN.UPLOAD_FILE_DONE'));
      }
    });
  }

  fileDownloadTask(files: any | any[], traffic: number) {
    if (!(files instanceof Array)) {
      files = [files];
    }
    files.forEach(file => {
      traffic -= file.size;
    });
    if (traffic < 0) {
      this.messageService.error(this.i18n.instant("EDEN.DOWNLOAD_FILE_TRAFFIC_ERROR"));
      return;
    }
    let nativePath;
    if (files.length === 1) {
      const filePath = nativePath;
      let filename = files[0].name.split('/').pop();
      filename = this.convertChar(filename, false);
      nativePath = remote.dialog.showSaveDialog({
        defaultPath: filename,
      });
    } else { nativePath = remote.dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] }); }
    if (!nativePath) { return; }
    const path = Array.from(this.currentPath);
    const bucketName = path.shift();
    const bucketId = this.currentBuckets.find(bucket => bucket.name === bucketName).id;
    this.runAll(files, async (file, env, cb) => {
      let filePath = nativePath;
      let filename = file.name.split('/').pop();
      filename = this.convertChar(filename, false);
      if (files.length > 1) { filePath = join(nativePath[0], filename); }
      let taskId = null;
      const taskEnv = env.resolveFile(bucketId, file.id, filePath, {
        overwrite: true,
        progressCallback: (process, doneBytes, allBytes) => {
          if (!taskId) { return; }
          this.updateTask(taskId, {
            process, doneBytes, allBytes,
            state: TASK_STATE.INPROCESS,
          });
        },
        finishedCallback: (err, fileId) => {
          if (err) {
            console.log(err);
            this.updateTask(taskId, {
              state: TASK_STATE.ERROR,
            });
            cb(true);
          } else {
            if (!taskId) { return; }
            this.updateTask(taskId, {
              state: TASK_STATE.DONE,
            });
            cb();
          }
        },
      });
      taskId = await this.newTask(TASK_TYPE.FILE_DOWNLOAD, {
        bucketId, bucketName, fileId: file.id, fileName: file.name, nativePath: path, env: taskEnv, allBytes: null,
      });
    }, false).then(errCount => {
      if (errCount === files.length) {
        this.messageService.error(this.i18n.instant('EDEN.DOWNLOAD_FILE_ERROR_ALL'));
      } else if (errCount) {
        this.messageService.warning(this.i18n.instant('EDEN.DOWNLOAD_FILE_ERROR', { errCount }));
      } else {
        this.messageService.success(this.i18n.instant('EDEN.DOWNLOAD_FILE_DONE'));
      }
    });
  }

  async fileRemoveTask(files: any[]) {
    const path = Array.from(this.currentPath);
    const bucketName = path.shift();
    const bucketId = this.currentBuckets.find(bucket => bucket.name === bucketName).id;
    this.runAll(files, (file, env, cb) => {
      env.deleteFile(bucketId, file.id, cb);
    });
    this.messageService.success(this.i18n.instant('EDEN.REMOVE_FILE_DONE'));
  }

  async cancelTask(taskId: string | string[]) {
    if (!(taskId instanceof Array)) { taskId = [taskId]; }
    await this.runAll(taskId, async (taskId, env, cb) => {
      const task: any = await this.ipc.dbGet('task', `SELECT * FROM task WHERE id = '${taskId}'`);
      if (task && task.state !== TASK_STATE.CANCEL) {
        const taskEnv = JSON.parse(task.env);
        switch (task.type) {
          case TASK_TYPE.FILE_DOWNLOAD:
            env.resolveFileCancel(taskEnv);
            break;
          case TASK_TYPE.FILE_UPLOAD:
            env.storeFileCancel(taskEnv);
            break;
        }
        await this.updateTask(taskId, {
          state: TASK_STATE.CANCEL,
        });
      }
      cb();
    });
    this.messageService.success(this.i18n.instant('EDEN.STOP_TASK_SUCCESS'));
  }

  removeTask(taskId: string | string[]) {
    if (!(taskId instanceof Array)) { taskId = [taskId]; }
    let count = 0;
    const allDone = () => {
      if (++count < taskId.length) { return; }
      this.loadTask();
      this.messageService.success(this.i18n.instant('EDEN.REMOVE_TASK_SUCCESS'));
    };
    taskId.forEach(async taskId => {
      console.log('task');
      await this.ipc.dbRun('task', `DELETE FROM task WHERE id='${taskId}'`);
      allDone();
    });
  }

  async bucketCreateTask(bucketName: string) {
    if (this.currentBuckets.find(bucket => bucket.name === bucketName)) {
      this.messageService.error(this.i18n.instant('EDEN.CREATE_BUCKET_EXISTS'));
      return;
    }
    await this.runAll([bucketName], (bucketName, env, cb) => {
      bucketName = this.convertChar(bucketName, true);
      env.createBucket(bucketName, cb);
    });
    this.messageService.success(this.i18n.instant('EDEN.CREATE_BUCKET_DONE'));
  }

  async bucketDeleteTask(buckets: any[]) {
    this.runAll(buckets, (bucket, env, cb) => {
      env.deleteBucket(bucket.id, cb);
    });
    this.messageService.success(this.i18n.instant('EDEN.DELETE_BUCKET_DONE'));
  }
}
