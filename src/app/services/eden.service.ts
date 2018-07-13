import { Injectable, ApplicationRef } from '@angular/core';
import { Environment } from "libgenaro";
import { WalletService } from './wallet.service';
import { BRIDGE_API_URL } from '../libs/config';

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
    let env = new Environment({
      bridgeUrl: BRIDGE_API_URL,
      keyFile: json,
      passphrase: password,
    });
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
      console.log(result);
    });
  }
  updateFiles(env) {
  }
  updateView(env) {

  }
  changePath() { }

}
