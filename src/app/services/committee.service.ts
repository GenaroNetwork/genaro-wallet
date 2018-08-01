import { Injectable } from '@angular/core';
import { TOP_FARMER_URL } from '../libs/config';
import { TransactionService } from './transaction.service';
import { BrotherhoodService } from './brotherhood.service';

@Injectable({
  providedIn: 'root'
})
export class CommitteeService {

  getMembers (obj) {
    //const subAccounts = this.brotherhoodService.getCurrentSubAccounts(obj.address);
    //obj.subAccounts = subAccounts || [];
    return obj;
  }

  async getSentinel(addr) {
    let url = TOP_FARMER_URL;
    if (addr) {
      url += '?address=' + addr;
    }
    const res = await fetch(url);
    return await res.json();
  }

  constructor(
    private txService: TransactionService,
    private brotherhoodService: BrotherhoodService
  ) { }

}
