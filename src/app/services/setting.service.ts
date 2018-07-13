import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  showWallet: boolean = true;
  showEden: boolean = true;
  showTxEden: boolean = true;
  showSharer: boolean = true;
  showTxSharer: boolean = true;
  constructor() { }

}
