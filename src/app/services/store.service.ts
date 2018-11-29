import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  wallets: {
    current: Wallet,
    all: Wallet[],
  } = {
      current: null,
      all: [],
    }
  constructor() { }

}
