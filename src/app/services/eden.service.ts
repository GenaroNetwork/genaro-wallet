import { Injectable, ApplicationRef } from '@angular/core';
import { Environment } from "libgenaro";
import { WalletService } from './wallet.service';
import { BRIDGE_API_URL } from '../libs/config';
import { NzMessageService } from '../../../node_modules/ng-zorro-antd';
import { TranslateService } from '../../../node_modules/@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class EdenService {

  allEnvs: any = {};
  requestEnv: boolean = false;
  currentBuckets: any = null;
  currentFiles: any = null;
  currentView: any = null;
  currentPath: string[] = [];

  constructor(
    private walletService: WalletService,
    private messageService: NzMessageService,
    private i18n: TranslateService,
    private appRef: ApplicationRef,
  ) {
    /*
    
    console.log(Environment);
    v8::Local<v8::String> bridgeUrl = options->Get(Nan::New("bridgeUrl").ToLocalChecked()).As<v8::String>();
    v8::Local<v8::String> key_file = options->Get(Nan::New("keyFile").ToLocalChecked()).As<v8::String>();
    v8::Local<v8::String> passphrase = options->Get(Nan::New("passphrase").
    */
    this.walletService.currentWallet.subscribe(wallet => {
      if (!wallet) return;
      this.updateAll();
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
    this.updateAll();
  }
  updateAll() {
    let env = this.allEnvs[this.walletService.wallets.current];
    if (!env) {
      this.requestEnv = true;
      return;
    }
    this.updateBuckets(env);
    if (this.currentPath.length !== 0)
      this.updateFiles(env);
  }
  updateBuckets(env) {
    env.getBuckets((err, result) => {
      if (err) throw new Error(err);
      console.log(env);
      this.currentBuckets = [];
      result.forEach(bucket => {
        this.currentBuckets.push({
          id: bucket.id,
          name: bucket.name,
          created: bucket.created,
        });
      });
    });
  }
  updateFiles(env) {
    let bucket = this.currentBuckets.find(bucket => bucket.name === this.currentPath[0]);
    if (!bucket) throw Error("没有bucket");
    let bucketId = bucket.id;
    env.listFiles(bucket, (err => { }));
  }
  updateView(env) {

  }
  changePath() { }

}
