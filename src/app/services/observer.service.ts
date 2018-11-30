import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ObserverService {

  wallet: BehaviorSubject<Wallet> = new BehaviorSubject(null);
  wallets: BehaviorSubject<Wallet[]> = new BehaviorSubject([]);
  block: BehaviorSubject<any> = new BehaviorSubject(null);

  constructor() {
  }

}
